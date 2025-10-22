async function openCategoryProducts(categoryId, categoryName) {
  try {
    // ✅ store selected category for prefill
    localStorage.setItem("selectedCategoryId", categoryId);

    const res = await fetch(
      "http://localhost:3001/amazon/document/api/products"
    );
    if (!res.ok) throw new Error("Failed to fetch products");
    const products = await res.json();

    // ✅ Filter products by selected category
    const filtered = products.filter((p) => {
      let catId = null;
      if (p.categoryId) catId = String(p.categoryId);
      if (p.category && p.category._id) catId = String(p.category._id);
      return catId === categoryId;
    });

    // ✅ Update modal title and count
    document.getElementById("categoryProductsModalLabel").textContent =
      categoryName;
    document.getElementById("productCount").textContent =
      filtered.length > 0 ? filtered.length : "0";

    // ✅ Display products
    const container = document.getElementById("categoryProductsContainer");
    container.innerHTML = "";

    if (filtered.length === 0) {
      container.innerHTML = `<p class="text-muted text-center">No products yet in this category.</p>`;
    } else {
      filtered.forEach((p) => {
        const item = `
          <div class="product-item d-flex align-items-center justify-content-between border rounded-4 p-2 mb-2 shadow-sm bg-white">
            <div class="d-flex align-items-center">
              <img src="${
                Array.isArray(p.image) ? p.image[0] : p.image
              }" alt="${p.name}" class="rounded-3 me-3 product-img">
              <span class="fw-semibold product-name">${p.name}</span>
            </div>
            <div class="d-flex align-items-center">
              <button class="btn btn-sm text-primary me-2" onclick="editProduct('${
                p._id
              }')">
  <i class="fa-solid fa-pencil"></i>
</button>
              <button class="btn btn-sm text-danger" onclick="deleteProduct('${
                p._id
              }')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
        container.insertAdjacentHTML("beforeend", item);
      });
    }

    // ✅ Show modal
    const modal = new bootstrap.Modal(
      document.getElementById("categoryProductsModal")
    );
    modal.show();
  } catch (err) {
    console.error("Error loading category products:", err);
  }
}

// ✅ Manage modal transitions (Category → Add Product)
document.addEventListener("DOMContentLoaded", () => {
  const categoryModal = document.getElementById("categoryProductsModal");
  const addProductModal = document.getElementById("exampleModalToggle");
  const addProductBtn = document.getElementById("addProductBtn");

  const categoryInstance = new bootstrap.Modal(categoryModal);
  const addProductInstance = new bootstrap.Modal(addProductModal);

  addProductBtn.addEventListener("click", () => {
    categoryModal.classList.add("fade-out");
    setTimeout(() => {
      categoryInstance.hide();
      addProductInstance.show();
      categoryModal.classList.remove("fade-out");
    }, 300);
  });

  // ✅ Back to category list on cancel
  document
    .querySelector("#exampleModalToggle .btn-outline-success")
    .addEventListener("click", () => {
      addProductInstance.hide();
      setTimeout(() => {
        categoryInstance.show();
      }, 300);
    });
});

// ✅ Load categories and prefill dropdown
document.addEventListener("DOMContentLoaded", async () => {
  const categorySelect = document.getElementById("categorySelects"); // ✅ fixed ID to match form

  try {
    const response = await fetch(
      "http://localhost:3001/amazon/document/api/categories"
    );
    if (!response.ok) throw new Error("Failed to fetch categories");
    const categories = await response.json();

    const selectedCategoryId = localStorage.getItem("selectedCategoryId");

    categorySelect.innerHTML = `<option value="">-- Select a Category --</option>`;

    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat._id || cat.id || cat.name;
      option.textContent = cat.name || cat.categoryName || "Unnamed Category";

      // ✅ Prefill saved category
      if (
        selectedCategoryId &&
        (cat._id === selectedCategoryId || cat.id === selectedCategoryId)
      ) {
        option.selected = true;
      }

      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    categorySelect.innerHTML = `<option value="">⚠️ Failed to load categories</option>`;
  }
});

// ✅ Add Product + Auto-close + Instant UI update
async function addProductss(event) {
  event.preventDefault();

  const productName = document.getElementById("prodName").value;
  const productImage = document.getElementById("productImage").value; // leave as is
  const productDescription = document.getElementById("prodDecsription").value;
  const productPrice = document.getElementById("prodPrice").value;
  const productInStock = document.getElementById("prodStock").value;
  const productVariety = document.getElementById("variety").value;
  const productBenefits = document.getElementById("benefits").value;
  const productIngridients = document.getElementById("ingredients").value;
  const productCategory = document.getElementById("categorySelects").value; // ✅ matches dropdown ID now

  if (
    !productName ||
    !productImage ||
    !productDescription ||
    !productPrice ||
    !productInStock ||
    !productCategory ||
    !productVariety ||
    !productBenefits ||
    !productIngridients
  ) {
    Swal.fire({
      icon: "info",
      text: "All fields are required!",
      confirmButtonColor: "#2D85DE",
    });
    return;
  }

  const productImages = productImage
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i);
  const productIngridientsArr = productIngridients
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i);
  const productVarietyArr = productVariety
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i);

  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      icon: "error",
      text: "You must be logged in as Super Admin to add products",
      confirmButtonColor: "#2D85DE",
    });
    return;
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  if (payload.role !== "super_admin") {
    Swal.fire({
      icon: "error",
      text: "Access denied: Only Super Admins can add products",
      confirmButtonColor: "#2D85DE",
    });
    return;
  }

  try {
    const res = await fetch(
      "http://localhost:3001/amazon/document/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: productName,
          image: productImages,
          price: productPrice,
          description: productDescription,
          numberInStock: parseInt(productInStock, 10),
          categoryId: productCategory,
          variety: productVarietyArr,
          benefits: productBenefits,
          ingridients: productIngridientsArr,
        }),
      }
    );

    const result = await res.json();

    if (result._id) {
      Swal.fire({
        icon: "success",
        title: "Product Added",
        text: `Added "${result.name}" successfully!`,
        confirmButtonColor: "#00A859",
        timer: 2000,
        showConfirmButton: false,
      });

      // ✅ Close add modal and reopen category modal with updated list
      const addModalEl = document.getElementById("exampleModalToggle");
      const categoryModalEl = document.getElementById("categoryProductsModal");
      const addInstance = bootstrap.Modal.getInstance(addModalEl);
      addInstance.hide();

      setTimeout(() => {
        openCategoryProducts(
          productCategory,
          document.querySelector(
            `#categorySelect option[value='${productCategory}']`
          ).textContent
        );
      }, 700);

      // ✅ Reset form and clear stored category
      document.querySelector("#exampleModalToggle form").reset();
      localStorage.removeItem("selectedCategoryId");
    } else {
      Swal.fire({
        icon: "error",
        text: result.message || "Failed to add product",
        confirmButtonColor: "#2D85DE",
      });
    }
  } catch (err) {
    console.error("❌ Error creating product:", err);
    Swal.fire({
      icon: "error",
      text: "Server error while creating product",
      confirmButtonColor: "#2D85DE",
    });
  }
}

let categories = []; // store categories globally

// Load categories into dropdown
async function loadCategories() {
  try {
    const res = await fetch(
      "http://localhost:3001/amazon/document/api/categories"
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    categories = await res.json();

    const select = document.getElementById("categorySelect1");
    select.innerHTML = '<option value="">Choose a Category</option>';

    categories.forEach((cat) => {
      select.insertAdjacentHTML(
        "beforeend",
        `<option value="${cat._id}">${cat.name || cat.categoryName}</option>`
      );
    });

    select.addEventListener("change", handleCategorySelect);
  } catch (err) {
    console.error("Error loading categories:", err);
    Swal.fire({ icon: "error", title: "Could not load categories" });
  }
}

// Prefill inputs when a category is selected
function handleCategorySelect() {
  const selectedId = document.getElementById("categorySelect1").value;
  const cat = categories.find((c) => c._id === selectedId);

  if (cat) {
    document.getElementById("nameCat").value =
      cat.name || cat.categoryName || "";
    document.getElementById("catImageUrl").value =
      cat.image || cat.categoryImage || "";
  } else {
    document.getElementById("nameCat").value = "";
    document.getElementById("catImageUrl").value = "";
  }
}

// Update category
async function updateCategory() {
  const categoryId = document.getElementById("categorySelect1").value;
  const name = document.getElementById("nameCat").value.trim();
  const image = document.getElementById("catImageUrl").value.trim();

  if (!categoryId || !name || !image) {
    Swal.fire({ icon: "warning", title: "All fields are required" });
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/amazon/document/api/categories/${categoryId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          image: image,
        }),
      }
    );

    const raw = await response.text();
    console.log("Raw server response:", raw);

    if (!response.ok) throw new Error(raw);

    Swal.fire({
      icon: "success",
      title: "Category updated successfully!",
    }).then(() => location.reload());
  } catch (err) {
    console.error("Error updating category:", err);
    Swal.fire({
      icon: "error",
      title: "Failed to update category",
      text: err.message,
    });
  }
}

document.addEventListener("DOMContentLoaded", loadCategories);

async function deleteProduct(productId) {
  if (!productId) return;

  // Confirm before deleting
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This product will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it",
  });

  if (!result.isConfirmed) return; // stop if cancelled

  try {
    const res = await fetch(
      `http://localhost:3001/amazon/document/api/products/${productId}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete product");

    // Success alert
    await Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "The product has been deleted successfully.",
      confirmButtonColor: "#28a745",
    });

    // Optional: refresh product list or reload page
    location.reload();
  } catch (err) {
    console.error("Error deleting product:", err);
    Swal.fire({
      icon: "error",
      title: "Delete failed",
      text: err.message,
    });
  }
}

// 🔹 Fetch and populate all categories
async function loadCategories(selectedCategory = "") {
  try {
    const response = await fetch(
      "http://localhost:3001/amazon/document/api/categories"
    );
    if (!response.ok) throw new Error("Failed to fetch categories");

    const categories = await response.json();
    const categorySelect = document.getElementById("updateCategory");

    // Clear existing options
    categorySelect.innerHTML = '<option value="">Select category</option>';

    // Populate dropdown
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat._id; // ✅ send actual _id to backend
      option.textContent = cat.name;
      if (
        selectedCategory &&
        (cat._id === selectedCategory._id || cat.name === selectedCategory.name)
      ) {
        option.selected = true;
      }
      categorySelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

// 🔹 Open modal and load product info
async function editProduct(productId) {
  try {
    const response = await fetch(
      `http://localhost:3001/amazon/document/api/products/${productId}`
    );
    if (!response.ok) throw new Error("Failed to fetch product");

    const product = await response.json();

    // Fill modal fields
    document.getElementById("updateProductId").value = product._id || "";
    document.getElementById("updateName").value = product.name || "";
    document.getElementById("updatePrice").value = product.price || "";
    document.getElementById("updateStock").value = product.numberInStock || "";
    document.getElementById("updateDescription").value =
      product.description || "";
    document.getElementById("updateImages").value = Array.isArray(product.image)
      ? product.image.join(", ")
      : "";
    document.getElementById("updateVariety").value = Array.isArray(
      product.variety
    )
      ? product.variety.join(", ")
      : "";
    document.getElementById("updateBenefits").value = product.benefits || "";
    document.getElementById("updateIngredients").value = Array.isArray(
      product.ingridients
    )
      ? product.ingridients.join(", ")
      : "";

    // Load categories and preselect product category
    await loadCategories(product.category);

    // Show modal
    const updateModal = new bootstrap.Modal(
      document.getElementById("updateModal")
    );
    updateModal.show();
  } catch (error) {
    console.error("Error loading product:", error);
    Swal.fire({ icon: "error", text: "Failed to load product details." });
  }
}

document
  .getElementById("updateForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("updateProductId").value;
    const token = localStorage.getItem("key");

    if (!id) return Swal.fire({ icon: "error", text: "No product ID found!" });
    if (!token)
      return Swal.fire({
        icon: "error",
        text: "Missing authentication token!",
      });

    const payload = {
      name: document.getElementById("updateName").value.trim(),
      price: document.getElementById("updatePrice").value.trim(),
      numberInStock: parseInt(document.getElementById("updateStock").value, 10),
      description: document.getElementById("updateDescription").value.trim(),
      categoryId: document.getElementById("updateCategory").value.trim(),
      image: document
        .getElementById("updateImages")
        .value.split(",")
        .map((i) => i.trim())
        .filter((i) => i),
      variety: document
        .getElementById("updateVariety")
        .value.split(",")
        .map((i) => i.trim())
        .filter((i) => i),
      benefits: document.getElementById("updateBenefits").value.trim(),
      ingridients: document
        .getElementById("updateIngredients")
        .value.split(",")
        .map((i) => i.trim())
        .filter((i) => i),
    };

    try {
      const res = await fetch(
        `http://localhost:3001/amazon/document/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      // 👇 Try parsing JSON; if it fails, read as plain text
      let result;
      const text = await res.text();
      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text };
      }

      if (!res.ok) {
        console.error("Update failed:", result);
        return Swal.fire({
          icon: "error",
          text: result.message || "Failed to update product",
        });
      }

      Swal.fire({
        icon: "success",
        text: "Product updated successfully!",
      });

      // ✅ Close modal properly
      const modalEl = document.getElementById("updateModal");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      // ✅ Refresh product list
      if (typeof fetchProducts === "function") fetchProducts();
    } catch (err) {
      console.error("Server error:", err);
      Swal.fire({
        icon: "error",
        text: "Server error — please try again later.",
      });
    }
  });
