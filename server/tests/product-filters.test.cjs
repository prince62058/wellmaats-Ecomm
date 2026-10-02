const test = require('node:test');
const assert = require('node:assert/strict');
const id = require.resolve('../models/Product');
let databaseFilter;
require.cache[id] = {id,filename:id,loaded:true,exports:{find: filter => { databaseFilter=filter;return {lean:async()=>[
  {_id:'regular',title:'Regular',price:1500,salePrice:900},
  {_id:'flash',title:'Flash',price:1200,salePrice:1000,flashSalePrice:800,isFlashSale:true},
  {_id:'expired',title:'Expired',price:1200,salePrice:1100,flashSalePrice:400,isFlashSale:true,flashSaleEndsAt:'2020-01-01'},
]};}}};
const {getFilteredProducts} = require('../controllers/shop/products-controller');
test('catalog filters forward hierarchy and sort/range by active selling price',async()=>{
 const response={status(){return this;},json(body){this.body=body;}};
 await getFilteredProducts({query:{mainCategory:'wellness',subCategory:'daily',brand:'wellmaats',productType:'Capsule',availability:'in-stock',rating:'4',priceRange:'500-1000',sortBy:'price-lowtohigh'}},response);
 assert.deepEqual(databaseFilter.mainCategory,{$in:['wellness']});
 assert.deepEqual(databaseFilter.subCategory,{$in:['daily']});
 assert.deepEqual(databaseFilter.productType,{$in:['Capsule']});
 assert.deepEqual(databaseFilter.totalStock,{$gt:0});
 assert.deepEqual(response.body.data.map(p=>p._id),['flash','regular']);
});
