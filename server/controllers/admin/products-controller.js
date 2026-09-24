const { imageUploadUtil } = require("../../helpers/spaces");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

// handle multiple images upload
const handleMultipleImagesUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided" });
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const url = "data:" + file.mimetype + ";base64," + b64;
      const result = await imageUploadUtil(url);
      return {
        url: result.url || result.secure_url,
        public_id: result.public_id,
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Multi-image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading images",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      images,
      video,
      title,
      description,
      mainCategory,
      category,
      subCategory,
      childCategory,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      ingredients,
      benefits,
      howToUse,
      dosage,
      isFeatured,
      isFlashSale,
      flashSaleEndsAt,
      offerLabel,
      productType,
      sizeValue,
      sizeUnit,
      netWeight,
      weightUnit,
      grossWeightInGrams,
      gstRate,
      hsnCode,
      isTaxInclusive,
      manufacturingDetails,
    } = req.body;

    const normalizedImages = Array.isArray(images)
      ? images.filter(Boolean)
      : image
      ? [image]
      : [];

    const primaryImage = image || (normalizedImages.length > 0 ? normalizedImages[0] : "");

    const newlyCreatedProduct = new Product({
      image: primaryImage,
      images: normalizedImages,
      video: video || "",
      title,
      description,
      mainCategory: mainCategory || "",
      category: category || subCategory || "",
      subCategory: subCategory || category || "",
      childCategory: childCategory || "",
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      ingredients,
      benefits,
      howToUse,
      dosage,
      isFeatured: isFeatured === true || isFeatured === "true",
      isFlashSale: isFlashSale === true || isFlashSale === "true",
      flashSaleEndsAt: flashSaleEndsAt || null,
      offerLabel: offerLabel || "Flash Sale",
      productType: productType || "Capsule",
      sizeValue: sizeValue || "",
      sizeUnit: sizeUnit || "",
      netWeight: netWeight !== "" && netWeight != null ? Number(netWeight) : 0,
      weightUnit: weightUnit || "gm",
      grossWeightInGrams: grossWeightInGrams !== "" && grossWeightInGrams != null ? Number(grossWeightInGrams) : 250,
      gstRate: gstRate !== "" && gstRate != null ? Number(gstRate) : 5,
      hsnCode: hsnCode || "3004",
      isTaxInclusive: isTaxInclusive !== undefined ? (isTaxInclusive === true || isTaxInclusive === "true") : true,
      manufacturingDetails: manufacturingDetails || {},
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      images,
      video,
      title,
      description,
      mainCategory,
      category,
      subCategory,
      childCategory,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      ingredients,
      benefits,
      howToUse,
      dosage,
      isFeatured,
      isFlashSale,
      flashSaleEndsAt,
      offerLabel,
      productType,
      sizeValue,
      sizeUnit,
      netWeight,
      weightUnit,
      grossWeightInGrams,
      gstRate,
      hsnCode,
      isTaxInclusive,
      manufacturingDetails,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    findProduct.title = title ?? findProduct.title;
    findProduct.description = description ?? findProduct.description;
    if (mainCategory !== undefined) findProduct.mainCategory = mainCategory;
    if (category !== undefined) findProduct.category = category;
    if (subCategory !== undefined) findProduct.subCategory = subCategory;
    if (childCategory !== undefined) findProduct.childCategory = childCategory;
    findProduct.brand = brand ?? findProduct.brand;
    findProduct.price = price === "" ? 0 : price ?? findProduct.price;
    findProduct.salePrice =
      salePrice === "" ? 0 : salePrice ?? findProduct.salePrice;
    findProduct.totalStock = totalStock ?? findProduct.totalStock;

    if (images !== undefined) {
      findProduct.images = Array.isArray(images) ? images.filter(Boolean) : (images ? [images] : []);
    }
    if (image !== undefined) {
      findProduct.image = image;
    } else if (findProduct.images && findProduct.images.length > 0 && !findProduct.image) {
      findProduct.image = findProduct.images[0];
    }
    if (video !== undefined) {
      findProduct.video = video;
    }

    findProduct.averageReview = averageReview ?? findProduct.averageReview;
    if (ingredients !== undefined) findProduct.ingredients = ingredients;
    if (benefits !== undefined) findProduct.benefits = benefits;
    if (howToUse !== undefined) findProduct.howToUse = howToUse;
    if (dosage !== undefined) findProduct.dosage = dosage;
    if (isFeatured !== undefined) {
      findProduct.isFeatured = isFeatured === true || isFeatured === "true";
    }
    if (isFlashSale !== undefined) {
      findProduct.isFlashSale = isFlashSale === true || isFlashSale === "true";
    }
    if (flashSaleEndsAt !== undefined) {
      findProduct.flashSaleEndsAt = flashSaleEndsAt || null;
    }
    if (offerLabel !== undefined) findProduct.offerLabel = offerLabel;

    if (productType !== undefined) findProduct.productType = productType;
    if (sizeValue !== undefined) findProduct.sizeValue = sizeValue;
    if (sizeUnit !== undefined) findProduct.sizeUnit = sizeUnit;
    if (netWeight !== undefined) findProduct.netWeight = netWeight === "" ? 0 : Number(netWeight);
    if (weightUnit !== undefined) findProduct.weightUnit = weightUnit;
    if (grossWeightInGrams !== undefined) findProduct.grossWeightInGrams = grossWeightInGrams === "" ? 250 : Number(grossWeightInGrams);
    if (gstRate !== undefined) findProduct.gstRate = gstRate === "" ? 5 : Number(gstRate);
    if (hsnCode !== undefined) findProduct.hsnCode = hsnCode || "3004";
    if (isTaxInclusive !== undefined) findProduct.isTaxInclusive = isTaxInclusive === true || isTaxInclusive === "true";
    if (manufacturingDetails !== undefined) {
      const existingMfg = findProduct.manufacturingDetails && findProduct.manufacturingDetails.toObject
        ? findProduct.manufacturingDetails.toObject()
        : (findProduct.manufacturingDetails || {});
      findProduct.manufacturingDetails = {
        ...existingMfg,
        ...manufacturingDetails,
      };
    }

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  handleImageUpload,
  handleMultipleImagesUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
