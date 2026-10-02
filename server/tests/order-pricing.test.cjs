const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const mock = (relative, exports) => { const id = require.resolve(path.join(__dirname, '..', relative)); require.cache[id] = { id, filename: id, loaded: true, exports }; };
let product, coupon, created, gatewayAmount;
mock('models/Cart', {findOne: () => ({populate: async () => ({_id:'cart1',items:[{productId:product,quantity:1}]})})});
mock('models/Address', {findOne: () => ({lean: async () => ({_id:'address1',address:'Test street',city:'Delhi',pincode:'110001',phone:'123'})})});
mock('models/SiteSettings', {findOne: () => ({lean: async () => ({taxSettings:{defaultGstRate:5,gstNumber:'TEST-GST'},shippingSettings:{}})})});
mock('models/User', {findById: async () => ({walletBalance:0})});
mock('models/Coupon', {findOne: async () => coupon});
mock('models/Order', {create: async data => {created=data;return {_id:'order1',...data};}});
mock('models/Product', {});
mock('controllers/shop/referral-controller', {processReferralReward:async()=>{}});
mock('helpers/razorpay', {orders:{create:async data => {gatewayAmount=data.amount;return {id:'rzp_order1'};}}});
const {createOrder} = require('../controllers/shop/order-controller');
async function request(body={}) {
 product={_id:'product1',title:'Wellness',price:1200,salePrice:1000,flashSalePrice:800,isFlashSale:true,totalStock:10,grossWeightInGrams:500,gstRate:5,hsnCode:'3004'};
 const res={statusCode:200,status(n){this.statusCode=n;return this;},json(data){this.body=data;return this;}};
 await createOrder({user:{id:'user1'},body:{addressInfo:{addressId:'address1'},totalAmount:1,gstAmount:999, ...body}},res);
 return res;
}
test('order and gateway use catalog flash price, reverse GST and delivery rather than browser totals',async()=>{
 const res=await request();
 assert.equal(res.statusCode,201);
 assert.equal(created.subTotal,800); assert.equal(created.taxableAmount,761.90); assert.equal(created.gstAmount,38.10);
 assert.equal(created.deliveryCharges,70); assert.equal(created.totalAmount,870); assert.equal(gatewayAmount,87000);
 assert.equal(created.cartItems[0].hsnCode,'3004'); assert.equal(created.cartItems[0].price,800);
});
test('coupon is validated and allocated before GST; arbitrary client discount is ignored',async()=>{
 coupon={code:'SAVE10',isActive:true,discountType:'percentage',discountAmount:10,minOrderAmount:0,userUsageLimit:1,usedBy:[]};
 const res=await request({couponDetails:{couponCode:'SAVE10',couponDiscount:799}});
 assert.equal(res.statusCode,201); assert.equal(created.couponDetails.couponDiscount,80);
 assert.equal(created.taxableAmount,685.71); assert.equal(created.gstAmount,34.29); assert.equal(created.totalAmount,790); assert.equal(gatewayAmount,79000);
});
test('ineligible coupon cannot proceed to payment',async()=>{
 coupon={code:'EXPIRED',isActive:false};
 const res=await request({couponDetails:{couponCode:'EXPIRED'}});
 assert.equal(res.statusCode,400);
});
