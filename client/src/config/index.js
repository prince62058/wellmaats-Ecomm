import {
  PRODUCT_CATEGORIES,
  categoryOptionsMap,
  brandOptionsMap,
} from "./brand";

export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export function getAddProductFormElements(categories = PRODUCT_CATEGORIES, brands = [{ id: "mother-tatwa", label: "Mother Tatwa" }]) {
  return [
    {
      label: "Title",
      name: "title",
      componentType: "input",
      type: "text",
      placeholder: "Enter product title",
    },
    {
      label: "Description",
      name: "description",
      componentType: "textarea",
      placeholder: "Enter product description",
    },
    {
      label: "Ingredients",
      name: "ingredients",
      componentType: "textarea",
      placeholder: "Arjuna, Garlic, Cinnamon...",
    },
    {
      label: "Benefits",
      name: "benefits",
      componentType: "textarea",
      placeholder: "Key health benefits",
    },
    {
      label: "How to Use",
      name: "howToUse",
      componentType: "textarea",
      placeholder: "Take with warm water...",
    },
    {
      label: "Dosage",
      name: "dosage",
      componentType: "input",
      type: "text",
      placeholder: "10-15 drops twice daily",
    },
    {
      label: "Category",
      name: "category",
      componentType: "select",
      options: categories,
    },
    {
      label: "Brand",
      name: "brand",
      componentType: "select",
      options: brands,
    },
    {
      label: "Price",
      name: "price",
      componentType: "input",
      type: "number",
      placeholder: "Enter product price",
    },
    {
      label: "Sale Price",
      name: "salePrice",
      componentType: "input",
      type: "number",
      placeholder: "Enter sale price (optional)",
    },
    {
      label: "Total Stock",
      name: "totalStock",
      componentType: "input",
      type: "number",
      placeholder: "Enter total stock",
    },
    {
      label: "Featured Product",
      name: "isFeatured",
      componentType: "select",
      options: [
        { id: "true", label: "Yes" },
        { id: "false", label: "No" },
      ],
    },
  ];
}

export const addProductFormElements = getAddProductFormElements();

export const shoppingViewHeaderMenuItems = [
  { id: "home", label: "Home", path: "/shop/home" },
  { id: "products", label: "Shop All", path: "/shop/listing" },
];

export { categoryOptionsMap, brandOptionsMap };

export const filterOptions = {
  category: PRODUCT_CATEGORIES,
  brand: [{ id: "mother-tatwa", label: "Mother Tatwa" }],
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];
