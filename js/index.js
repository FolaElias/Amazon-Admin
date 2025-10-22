function adminLogin(event) {
  event.preventDefault();

  const getEmail = document.getElementById('adminEmail').value.trim();
  const getPassword = document.getElementById('adminPassword').value.trim();

  if (!getEmail || !getPassword) {
    Swal.fire({
      icon: 'info',
      text: 'All fields are required!',
      confirmButtonColor: "#2D85DE"
    });
    return;
  }

  const signData = { email: getEmail, password: getPassword };

  fetch('http://localhost:3001/amazon/document/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signData)
  })
    .then(response => response.json())
    .then(result => {
      console.log("Login result:", result);

      // ✅ Check for valid token
      if (result.success || result.token) {
        try {
          const tokenParts = result.token.split(".");
          const payload = JSON.parse(atob(tokenParts[1])); // decode JWT payload

          console.log("Decoded payload:", payload);

          // ✅ Role check
          if (payload.role && payload.role.toLowerCase() === "super_admin") {

            // ✅ Save both token and user info to localStorage
            localStorage.setItem("token", result.token);
            localStorage.setItem("userName", result.name);
            localStorage.setItem("key", JSON.stringify(payload));

            Swal.fire({
              icon: 'success',
              text: 'Login Successful ✅',
              confirmButtonColor: "#2D85DE"
            });

            // ✅ Redirect to dashboard
            setTimeout(() => {
              window.location.href = "dashboard.html";
            }, 1500);

          } else {
            Swal.fire({
              icon: 'error',
              text: 'Access denied: Only Super Admins can log in here ❌',
              confirmButtonColor: "#2D85DE"
            });
          }

        } catch (err) {
          console.error("Error decoding token:", err);
          Swal.fire({
            icon: 'error',
            text: 'Invalid login response. Please try again.',
            confirmButtonColor: "#2D85DE"
          });
        }

      } else {
        Swal.fire({
          icon: 'info',
          text: result.message || 'Login Failed',
          confirmButtonColor: "#2D85DE"
        });
      }
    })
    .catch(err => {
      console.error("Login error:", err);
      Swal.fire({
        icon: 'error',
        text: 'Network or server error. Please try again.',
        confirmButtonColor: "#2D85DE"
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Get stored admin name
    const adminName = localStorage.getItem("userName"); // 👈 change key if you used another one

    const nameSpan = document.getElementById("userName");

    if (adminName && nameSpan) {
      // Capitalize the first letter for a clean display
      const formattedName = adminName.charAt(0).toUpperCase() + adminName.slice(1);
      nameSpan.textContent = formattedName;
    } else {
      // Optional: show placeholder if not logged in
      nameSpan.textContent = "Guest";
    }
});
  

// function addProducts(event) {
//   event.preventDefault();

//   const productName = document.getElementById('prodName').value;
//   const productImage = document.getElementById('productImage').value; // ✅ fixed typo
//   const productDescription = document.getElementById('prodDecsription').value;
//   const productPrice = document.getElementById('prodPrice').value;
//   const productInStock = document.getElementById('prodStock').value;
//   const productCategory = document.getElementById('categorySelect').value;

//   if (!productName || !productImage || !productDescription || !productPrice || !productInStock || !productCategory) {
//     Swal.fire({
//       icon: 'info',
//       text: 'All fields are required!',
//       confirmButtonColor: "#2D85DE"
//     });
//     return;
//   }

//   const token = localStorage.getItem("key");

//   fetch("http://localhost:3001/amazon/document/api/products", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${token}`
//     },
//     body: JSON.stringify({
//       name: productName,
//       image: productImage,
//       price: productPrice,
//       description: productDescription,
//       numberInStock: parseInt(productInStock, 10),
//       categoryId: productCategory
//     })
//   })
//     .then(res => res.json())
//     .then(result => {
//       console.log(result);
//       if (result._id) {
//         localStorage.setItem("prodId", result._id)
//         Swal.fire({
//             icon: 'success',
//             title: "Import Successful",
//             text: `Added new products to your store`,
//             confirmButtonColor: "#00A859"
//         })
//         setTimeout(() => {
//           location.reload();
//         }, 4000)
//       }
//     })
//     .catch(err => {
//       console.error("❌ Error creating product:", err);
//     });
// }

function addProducts(event) {
  event.preventDefault();

  const productName = document.getElementById('prodName').value;
  const productImage = document.getElementById('productImage').value; 
  const productDescription = document.getElementById('prodDecsription').value;
  const productPrice = document.getElementById('prodPrice').value;
  const productInStock = document.getElementById('prodStock').value;
  const productVariety = document.getElementById('variety').value;
  const productBenefits = document.getElementById('benefits').value;
  const productIngridients = document.getElementById('ingredients').value;
  const productCategory = document.getElementById('categorySelect').value;

  if (!productName || !productImage || !productDescription || !productPrice || !productInStock || !productCategory || !productVariety || !productBenefits || !productIngridients) {
    Swal.fire({
      icon: 'info',
      text: 'All fields are required!',
      confirmButtonColor: "#2D85DE"
    });
    return;
  }

  const productImages = productImage.split(",").map(i => i.trim()).filter(i => i);
  const productIngridientsArr = productIngridients.split(",").map(i => i.trim()).filter(i => i);
  const productVarietyArr = productVariety.split(",").map(i => i.trim()).filter(i => i);
  

  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      icon: 'error',
      text: 'You must be logged in as Super Admin to add products',
      confirmButtonColor: "#2D85DE"
    });
    return;
  }

  // ✅ Decode token payload (role check)
  const tokenParts = token.split(".");
  const payload = JSON.parse(atob(tokenParts[1]));

  if (payload.role !== "super_admin") {
    Swal.fire({
      icon: 'error',
      text: 'Access denied: Only Super Admins can add products',
      confirmButtonColor: "#2D85DE"
    });
    return;
  }

  // ✅ Now allow product creation
  fetch("http://localhost:3001/amazon/document/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
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
      ingridients: productIngridientsArr
    })
  })
    .then(res => res.json())
    .then(result => {
      console.log(result);
      if (result._id) {
        localStorage.setItem("prodId", result._id);
        Swal.fire({
          icon: 'success',
          title: "Import Successful",
          text: `Added new product to your store`,
          confirmButtonColor: "#00A859"
        });
        setTimeout(() => {
          location.reload();
        }, 4000);
      } else {
        Swal.fire({
          icon: 'error',
          text: result.message || "Failed to add product",
          confirmButtonColor: "#2D85DE"
        });
      }
    })
    .catch(err => {
      console.error("❌ Error creating product:", err);
      Swal.fire({
        icon: 'error',
        text: "Server error while creating product",
        confirmButtonColor: "#2D85DE"
      });
    });
}


function toggleNotification(event) {
  event.preventDefault();
  event.stopPropagation(); // stop bubbling
  const isMobile = window.innerWidth < 768;
  const popup = document.getElementById(isMobile ? 'notificationPopUp1' : 'notificationPopUp');
  const otherPopup = document.getElementById(isMobile ? 'notificationPopUp' : 'notificationPopUp1');
  // Hide the other popup (if open)
  if (otherPopup) otherPopup.style.display = 'none';
  // Toggle visibility
  popup.style.display =
    popup.style.display === 'block' ? 'none' : 'block';
}
document.addEventListener("click", (e) => {
  if (!e.target.closest("#notificationPopUp") &&
      !e.target.closest("#notificationPopUp1") &&
      !e.target.closest(".btnSharp")) {
    document.getElementById("notificationPopUp").style.display = "none";
    document.getElementById("notificationPopUp1").style.display = "none";
  }
});










const searchInput = document.getElementById("searchInput");
const searchIcon = document.querySelector(".search-icon");

searchIcon.addEventListener("click", () => {
  if (window.innerWidth < 768) { // only apply expand/collapse on small screens
    searchInput.classList.toggle("show");
    if (searchInput.classList.contains("show")) {
      searchInput.focus();
    }
  }
});


// function createCategory(event) {
//   event.preventDefault();

//   const spinItem = document.querySelector('.spin2');
//   spinItem.style.display = "inline-block";

//   const catName = document.getElementById('cat').value;

//   if (catName === '') {
//     Swal.fire({
//       icon: 'info',
//       text: 'All fields are required!',
//       confirmButtonColor: "#2D85DE"
//     });
//        spinItem.style.display = "none";
//         return;
//   }

//   const token = localStorage.getItem("key");

//   fetch("http://localhost:3001/amazon/document/api/categories", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-auth-token": token
//     },
//     body: JSON.stringify({
//       name: catName,
//     })
//   })
//     .then(res => res.json())
//     .then(result => {
//       console.log(result);
//       if (result._id) {
//         localStorage.setItem("catId", result._id)
//         Swal.fire({
//             icon: 'success',
//             title: "Created successfully",
//             text: `Added new Category to your store`,
//             confirmButtonColor: "#00A859"
//         })
//         setTimeout(() => {
//           location.reload();
//         }, 4000)
//       }
//     })
//     .catch(err => {
//       console.error("❌ Error creating product:", err);
//     });
// }
async function addCategory() {
  const name = document.getElementById("catName")?.value.trim();
  const image = document.getElementById("catImage")?.value.trim();

  if (!name || !image) {
    Swal.fire({
      icon: "warning",
      title: "All fields are required",
      confirmButtonColor: "#F58634"
    });
    return;
  }

  try {
    const res = await fetch("http://localhost:3001/amazon/document/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image })
    });

    const data = await res.json(); // 👈 check actual response
    console.log("Server response:", data);

    if (!res.ok) throw new Error(data.message || "Failed to add category");

    Swal.fire({
      icon: "success",
      title: "Category added successfully!",
      confirmButtonColor: "#28a745"
    }).then(() => location.reload());
  } catch (err) {
    console.error("Error:", err);
    Swal.fire({
      icon: "error",
      title: "Error adding category",
      text: err.message
    });
  }
}



// function updateCategory(id, newName) {
//   const token = localStorage.getItem("key");

//   fetch(`http://localhost:3001/amazon/document/api/categories/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       "x-auth-token": token
//     },
//     body: JSON.stringify({ name: newName })
//   })
//     .then(res => res.json())
//     .then(result => {
//       console.log("Updated:", result);
//       Swal.fire({
//         icon: "success",
//         title: "Updated successfully",
//         text: `Category renamed to ${result.name}`,
//         confirmButtonColor: "#00A859"
//       });
//     })
//     .catch(err => {
//       console.error("❌ Error updating category:", err);
//     });
// }





// function createCategory(event) {
//   event.preventDefault();

//   const spinItem = document.querySelector('.spin2');
//   if (spinItem) spinItem.style.display = "inline-block";

//   const catName = document.getElementById('cat').value.trim();

//   if (!catName) {
//     Swal.fire({
//       icon: 'info',
//       text: 'All fields are required!',
//       confirmButtonColor: "#2D85DE"
//     });
//     return;
    
//   }
//   spinItem.style.display = "none";

//   const token = localStorage.getItem("key");

//   fetch("http://localhost:3001/amazon/document/api/categories", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-auth-token": token
//     },
//     body: JSON.stringify({ name: catName })
//   })
//     .then(res => res.json().then(data => ({ status: res.status, body: data })))
//     .then(({ status, body }) => {
//       console.log(body);

//       if (status === 401 || status === 403) {
//         Swal.fire({
//           icon: 'error',
//           title: "Unauthorized",
//           text: body.message || "Only superadmins can create categories",
//           confirmButtonColor: "#E63946"
//         });
//         return;
//       }

//       if (body._id) {
//         localStorage.setItem("catId", body._id);
//         Swal.fire({
//           icon: 'success',
//           title: "Created successfully",
//           text: `Added new Category to your store`,
//           confirmButtonColor: "#00A859"
//         });
//         setTimeout(() => location.reload(), 3000);
//       }
//     })
//     .catch(err => {
//       console.error("❌ Error creating category:", err);
//       Swal.fire({
//         icon: 'error',
//         title: "Oops!",
//         text: "Something went wrong while creating category.",
//         confirmButtonColor: "#E63946"
//       });
//     })
//     .finally(() => {
//       if (spinItem) spinItem.style.display = "none";
//     });
// }




async function loadOrders() {
  try {
    const res = await fetch("http://localhost:3001/amazon/document/api/orders");
    const orders = await res.json();

    const tbody = document.getElementById("ordersTableBody");
    tbody.innerHTML = "";

    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center">No orders found</td></tr>`;
      return;
    }

    orders.forEach(order => {
      const fullName = `${order.customerSnapshot?.firstName || ""} ${order.customerSnapshot?.lastName || ""}`.trim();

      const row = `
        <tr style="cursor:pointer" onclick="showOrderDetails(${JSON.stringify(order).replace(/"/g, '&quot;')})">
          <td>${order.transactionId || "N/A"}</td>
          <td>${new Date(order.createdAt).toLocaleString()}</td>
          <td>${fullName || "Unknown"}</td>
          <td>
            <span class="badge ${order.paymentStatus === "paid" ? "bg-success" : "bg-danger"}">
              ${order.paymentStatus}
            </span>
          </td>
          <td>
            <span class="badge ${order.deliveryStatus === "deliverd" ? "bg-success" : "bg-warning"}">
              ${order.deliveryStatus}
            </span>
          </td>
          <td>₦${order.totalAmount.toLocaleString()}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error("Error loading orders:", err);
  }
}

function showOrderDetails(order) {
  const fullName = `${order.customerSnapshot?.firstName || ""} ${order.customerSnapshot?.lastName || ""}`.trim();

  // Order items
  const itemsHtml = order.items.map(item => `
    <div class="col-md-6 mb-3">
      <div class="card card-one p-2">
        <img src="${item.image || 'https://via.placeholder.com/150'}" class="card-img-top rounded" alt="${item.name}">
        <div class="card-body">
          <h6 class="card-title">${item.name}</h6>
         <div class= "d-flex  justify-content-between">
          <p>Quantity: ${item.quantity}</p>
          <p class="text-success fw-bold">₦${(item.price * item.quantity).toLocaleString()}</p>
         </div>
        </div>
      </div>
    </div>
  `).join("");

  const customer = order.customerSnapshot || {};
  
  const content = `
    <h5> #${order.transactionId}</h5>
    <div class="row">
      <div class="col-md-8">
        <div class="row">${itemsHtml}</div>
      </div>
      <div class="col-md-4">
        <div class="card p-3">
          <h6>Customer Information</h6>
          <img src="https://ui-avatars.com/api/?name=${fullName}" class="rounded-circle mb-2" width="100" height="100">
          <p><strong>${fullName}</strong></p>
          <p>${customer.email || ""}</p>
          <p>${customer.phone || ""}</p>
          <hr>
          <h6>Shipping Address</h6>
          <p>${customer.address || ""}, ${customer.city || ""}, ${customer.state || ""}</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("orderDetailsContent").innerHTML = content;
  new bootstrap.Modal(document.getElementById("orderDetailsModal")).show();
}


document.addEventListener("DOMContentLoaded", () => {
  const ordersTable = document.getElementById("ordersTableBody");
  if (ordersTable) loadOrders(); // ✅ only run if orders table exists
});




async function loadCategories() {
  try {
    const response = await fetch("http://localhost:3001/amazon/document/api/categories"); 
    if (!response.ok) throw new Error("Failed to fetch categories");

    const categories = await response.json(); 
    const select = document.getElementById("categorySelect");

    // Clear old options (except first one)
    select.innerHTML = `<option value="">-- Select a Category --</option>`;

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category._id;  // assuming your API returns MongoDB _id
      option.textContent = category.name; // or category.title depending on schema
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}
document.addEventListener("DOMContentLoaded", loadCategories);





function logOut() {
  Swal.fire({
    title: 'Are you sure?',
    text: "You will be logged out of your account.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085D6',
    confirmButtonText: 'Yes, log me out',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      // :siren: Clear stored login data
      localStorage.removeItem("key");
      localStorage.removeItem("role");
      localStorage.removeItem("customerid");
      localStorage.removeItem("customerloginid");
      Swal.fire({
        icon: 'success',
        title: 'Logged out',
        text: 'You have been successfully logged out.',
        confirmButtonColor: '#28A745'
      }).then(() => {
        location.href = "index.html"; // redirect to login page
      });
    }
  });
}
const countrySelect = document.getElementById("country");
  const stateSelect = document.getElementById("state");
  const citySelect = document.getElementById("city");
  // Load countries
  async function loadCountries() {
    try {
      const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
      const data = await res.json();
      const countries = Array.isArray(data) ? data : [];
      countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      countries.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.name.common;
        opt.textContent = c.name.common;
        countrySelect.appendChild(opt);
      });
      // :white_check_mark: Auto-select Nigeria if available
      const defaultCountry = "Nigeria";
      const nigeriaOption = [...countrySelect.options].find(
        opt => opt.value === defaultCountry
      );
      if (nigeriaOption) {
        countrySelect.value = defaultCountry;
        await loadStates(defaultCountry); // load states immediately
      }
    } catch (err) {
      console.error("Error loading countries:", err);
    }
  }
  // Load states when country is selected
  async function loadStates(country) {
    try {
      stateSelect.innerHTML = `<option value="">Loading...</option>`;
      stateSelect.disabled = true;
      citySelect.innerHTML = `<option value="">Select City</option>`;
      citySelect.disabled = true;
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country })
      });
      const data = await res.json();
      stateSelect.innerHTML = `<option value="">Select State</option>`;
      if (data.data && data.data.states) {
        data.data.states.forEach(s => {
          const opt = document.createElement("option");
          opt.value = s.name;
          opt.textContent = s.name;
          stateSelect.appendChild(opt);
        });
      }
      stateSelect.disabled = false;
    } catch (err) {
      console.error("Error loading states:", err);
      stateSelect.innerHTML = `<option value="">No states found</option>`;
    }
  }
  // Load cities when state is selected
async function loadCities(country, state) {
  try {
    citySelect.innerHTML = `<option value="">Loading...</option>`;
    citySelect.disabled = true;
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, state })
    });
    const data = await res.json();
    // :white_check_mark: log AFTER defining "data"
    console.log("Fetching cities for:", country, state, data);
    citySelect.innerHTML = `<option value="">Select City</option>`;
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      data.data.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
      });
      citySelect.disabled = false;
    } else {
      citySelect.innerHTML = `<option value="">No cities found</option>`;
    }
  } catch (err) {
    console.error("Error loading cities:", err);
    citySelect.innerHTML = `<option value="">No cities found</option>`;
  }
}
  // Event listeners
  countrySelect.addEventListener("change", e => {
    const country = e.target.value;
    if (country) {
      loadStates(country);
    } else {
      stateSelect.innerHTML = `<option value="">Select State</option>`;
      stateSelect.disabled = true;
      citySelect.innerHTML = `<option value="">Select City</option>`;
      citySelect.disabled = true;
    }
  });
  stateSelect.addEventListener("change", e => {
    const state = e.target.value;
    const country = countrySelect.value;
    if (state && country) {
      loadCities(country, state);
    } else {
      citySelect.innerHTML = `<option value="">Select City</option>`;
      citySelect.disabled = true;
    }
  });
  // Initial load
  loadCountries();

const form = document.getElementById("addDistributorForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("distributorName").value.trim();
  const phoneNumber = document.getElementById("distributorPhone").value.trim();
  const email = document.getElementById("distributorEmail").value.trim();
  const password = document.getElementById("distributorPassword").value.trim();
  const role = document.getElementById("distributorRole").value;
  const country = document.getElementById("country").value;
  const state = document.getElementById("state").value;
  const city = document.getElementById("city").value;

  // ✅ 1. Basic validation
  if (!name || !phoneNumber || !email || !password || !country || !state || !city) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: "Please fill in all fields."
    });
    return;
  }

  // ✅ 2. Phone number validation (must be exactly 11 digits)
  if (!/^\d{11}$/.test(phoneNumber)) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Phone Number",
      text: "Phone number must contain exactly 11 digits (e.g. 08012345678)."
    });
    return;
  }

  // ✅ 3. Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("key")); // Adjust "key" if different in your login code

  if (!currentUser) {
    Swal.fire({
      icon: "error",
      title: "Not Logged In",
      text: "You must be logged in to add a distributor."
    });
    return;
  }

  // ✅ 4. Check user role (must be super_admin)
  if (currentUser.role.toLowerCase() !== "super_admin") {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "Only a Super Admin can create a distributor."
    });
    return;
  }

  try {
    const res = await fetch("http://localhost:3001/amazon/document/api/register/create-distributor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phoneNumber,
        email,
        password,
        role: role.toLowerCase(), // force lowercase
        country,
        state,
        city
      })
    });

    if (!res.ok) throw new Error("Failed to add distributor");

    const data = await res.json();
    console.log("Distributor added:", data);

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("distributorModal"));
    modal.hide();

    // Reset form
    form.reset();
    document.getElementById("distributorRole").value = "distributor";
    stateSelect.innerHTML = `<option value="">Select State</option>`;
    stateSelect.disabled = true;
    citySelect.innerHTML = `<option value="">Select City</option>`;
    citySelect.disabled = true;

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Distributor added successfully ✅",
      timer: 2000,
      showConfirmButton: false
    });

  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Error adding distributor ❌"
    });
  }
});

// Load countries when modal opens
document.getElementById("distributorModal").addEventListener("shown.bs.modal", () => {
  if (countrySelect.options.length <= 1) {
    loadCountries();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("loadingSpinner");
  const tableBody = document.getElementById("productsTableBody");
  const searchInput = document.getElementById("searchInput");
  const pageSizeSelect = document.getElementById("pageSize");
  const pagination = document.getElementById("pagination");
  const updateModal = new bootstrap.Modal(document.getElementById("updateModal"));
  const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
  let products = [];
  let filteredProducts = [];
  let currentPage = 1;
  let pageSize = parseInt(pageSizeSelect.value);
  // ------------------- Fetch Products -------------------
  async function fetchProducts() {
    spinner.style.display = "block";
    const token = localStorage.getItem("key");
    if (!token) {
      Swal.fire({ icon: "error", text: "Unauthorized" });
      spinner.style.display = "none";
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/amazon/document/api/products", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid response");
      products = data;
      filteredProducts = [...products];
      renderTable();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", text: "Failed to load products" });
    } finally {
      spinner.style.display = "none";
    }
  }
  // ------------------- Render Table -------------------
  function renderTable() {
    tableBody.innerHTML = "";
    const query = searchInput.value.toLowerCase();
    filteredProducts = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const start = (currentPage - 1) * pageSize;
    const paginated = filteredProducts.slice(start, start + pageSize);
    paginated.forEach(p => {
      const firstImage = p.image?.[0] || "https://via.placeholder.com/50";
      const varietyBadges = (p.variety || []).map(v => `<span class="badge bg-info me-1">${v}</span>`).join("");
      const ingredientBadges = (p.ingridients || []).map(i => `<span class="badge bg-secondary me-1">${i}</span>`).join("");
      const row = `
        <tr>
          <td>${p.name}</td>
          <td><img src="${firstImage}" class="img-thumbnail" style="width:50px;height:50px;object-fit:cover;"></td>
          <td>${p.description}</td>
          <td>₦${Number(p.price).toLocaleString("en-NG")}</td>
          <td>${p.numberInStock}</td>
          <td>${p.category?.name || "N/A"}</td>
          <td>${varietyBadges}</td>
          <td>${p.benefits || ""}</td>
          <td>${ingredientBadges}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1 update-btn" data-id="${p._id}">Update</button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${p._id}">Delete</button>
          </td>
        </tr>`;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
    renderPagination(Math.ceil(filteredProducts.length / pageSize));
  }
  // ------------------- Pagination -------------------
  function renderPagination(totalPages) {
    pagination.innerHTML = "";
    if (totalPages <= 1) return;
    const prevDisabled = currentPage === 1 ? "disabled" : "";
    const nextDisabled = currentPage === totalPages ? "disabled" : "";
    pagination.insertAdjacentHTML("beforeend", `<li class="page-item ${prevDisabled}"><a class="page-link" href="#" onclick="changePage(${currentPage-1})">Previous</a></li>`);
    for (let i = 1; i <= totalPages; i++) {
      const active = i === currentPage ? "active" : "";
      pagination.insertAdjacentHTML("beforeend", `<li class="page-item ${active}"><a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`);
    }
    pagination.insertAdjacentHTML("beforeend", `<li class="page-item ${nextDisabled}"><a class="page-link" href="#" onclick="changePage(${currentPage+1})">Next</a></li>`);
  }
  window.changePage = (page) => { if (page >= 1) { currentPage = page; renderTable(); } };
  searchInput.addEventListener("input", () => { currentPage = 1; renderTable(); });
  pageSizeSelect.addEventListener("change", () => { pageSize = parseInt(pageSizeSelect.value); currentPage = 1; renderTable(); });
  // ------------------- Load Categories -------------------
  async function loadCategories() {
    const categorySelect = document.getElementById("updateCategory");
    categorySelect.innerHTML = `<option value="">Select category</option>`;
    try {
      const token = localStorage.getItem("key");
      const res = await fetch("http://localhost:3001/amazon/document/api/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const categories = await res.json();
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat._id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Failed to load categories" });
    }
  }
  // ------------------- Update & Delete Button Logic -------------------
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("update-btn")) {
      const id = e.target.dataset.id;
      const p = products.find(x => x._id === id);
      if (!p) return;
      document.getElementById("updateProductId").value = p._id;
      document.getElementById("updateName").value = p.name;
      document.getElementById("updatePrice").value = p.price;
      document.getElementById("updateStock").value = p.numberInStock;
      document.getElementById("updateDescription").value = p.description;
      document.getElementById("updateImages").value = p.image?.join(", ") || "";
      document.getElementById("updateVariety").value = p.variety?.join(", ") || "";
      document.getElementById("updateBenefits").value = p.benefits || "";
      document.getElementById("updateIngredients").value = p.ingridients?.join(",") || "";
      await loadCategories();
      document.getElementById("updateCategory").value = p.category?._id || "";
      updateModal.show();
    }
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      const p = products.find(x => x._id === id);
      if (!p) return;
      document.getElementById("deleteProductId").value = p._id;
      document.getElementById("deleteMessage").innerText = `Are you sure you want to delete "${p.name}"?`;
      deleteModal.show();
    }
  });
  // ------------------- Submit Update -------------------
  // ------------------- Submit Update Form -------------------
document.getElementById("updateForm").addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("updateProductId").value;
    const token = localStorage.getItem("key");
    try {
        const res = await fetch(`http://localhost:3001/amazon/document/api/products/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: document.getElementById("updateName").value,
                price: document.getElementById("updatePrice").value.trim(),
                numberInStock: parseInt(document.getElementById("updateStock").value, 10),
                description: document.getElementById("updateDescription").value,
                categoryId: document.getElementById("updateCategory").value.trim(),  // :white_check_mark: send _id as categoryId
                image: document.getElementById("updateImages").value
                        .split(",")
                        .map(i => i.trim())
                        .filter(i => i),
                variety: document.getElementById("updateVariety").value
                        .split(",")
                        .map(i => i.trim())
                        .filter(i => i),
                benefits: document.getElementById("updateBenefits").value,
                ingridients: document.getElementById("updateIngredients").value
                        .split(",")
                        .map(i => i.trim())
                        .filter(i => i)
            })
        });
        const result = await res.json();
        if (result._id) {
            Swal.fire({ icon: "success", text: "Product updated!" });
            updateModal.hide();
            fetchProducts(); // refresh table
        } else {
            Swal.fire({ icon: "error", text: result.message || "Failed to update" });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", text: "Server error" });
    }
});
  // ------------------- Confirm Delete -------------------
  document.getElementById("confirmDelete").addEventListener("click", async () => {
    const id = document.getElementById("deleteProductId").value;
    const token = localStorage.getItem("key");
    try {
      const res = await fetch(`http://localhost:3001/amazon/document/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) {
    Swal.fire({ icon: "success", text: "Deleted!" });
    deleteModal.hide();
    products = products.filter(p => p._id !== id);
    renderTable();
} else {
    const data = await res.json();
    Swal.fire({ icon: "error", text: data.message || "Failed to delete" });
}
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Server error" });
    }
  });
  fetchProducts();
});





  // Bootstrap modal instances
  // const updateModal = new bootstrap.Modal(document.getElementById("updateModal"));
  // const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));

  // // Handle Update button click
  // document.addEventListener("click", (e) => {
  //   if (e.target.classList.contains("update-btn")) {
  //     const id = e.target.dataset.id;
  //     const product = products.find(p => p._id === id);

  //     if (!product) return;

  //     // Prefill form
  //     document.getElementById("updateProductId").value = product._id;
  //     document.getElementById("updateName").value = product.name;
  //     document.getElementById("updatePrice").value = product.price;
  //     document.getElementById("updateStock").value = product.numberInStock;
  //     document.getElementById("updateCategory").value = product.category?.name || "";
  //     document.getElementById("updateDescription").value = product.description;
  //     document.getElementById("updateImages").value = product.image?.join(", ") || "";
  //     document.getElementById("updateVariety").value = product.variety?.join(", ") || "";
  //     document.getElementById("updateBenefits").value = product.benefits || "";
  //     document.getElementById("updateIngredients").value = product.ingredients?.join(", ") || "";

  //     updateModal.show();
  //   }
  // });

  // // Submit Update form
  // document.getElementById("updateForm").addEventListener("submit", async (e) => {
  //   e.preventDefault();
  //   const id = document.getElementById("updateProductId").value;
  //   const token = localStorage.getItem("key");

  //   try {
  //     const res = await fetch(`http://localhost:3001/amazon/document/api/products/${id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${token}`
  //       },
  //       body: JSON.stringify({
  //         name: document.getElementById("updateName").value,
  //         price: parseFloat(document.getElementById("updatePrice").value),
  //         numberInStock: parseInt(document.getElementById("updateStock").value, 10),
  //         description: document.getElementById("updateDescription").value,
  //         category: document.getElementById("updateCategory").value,
  //         image: document.getElementById("updateImages").value.split(",").map(i => i.trim()).filter(i => i),
  //         variety: document.getElementById("updateVariety").value.split(",").map(v => v.trim()).filter(v => v),
  //         benefits: document.getElementById("updateBenefits").value,
  //         ingredients: document.getElementById("updateIngredients").value.split(",").map(i => i.trim()).filter(i => i)
  //       })
  //     });
  //     const result = await res.json();

  //     if (result._id) {
  //       Swal.fire({ icon: "success", text: "Product updated successfully!" });
  //       updateModal.hide();
  //       fetchProducts(); // refresh table
  //     } else {
  //       Swal.fire({ icon: "error", text: result.message || "Failed to update product" });
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     Swal.fire({ icon: "error", text: "Server error during update" });
  //   }
  // });

  // // Handle Delete button click
  // document.addEventListener("click", (e) => {
  //   if (e.target.classList.contains("delete-btn")) {
  //     const id = e.target.dataset.id;
  //     const product = products.find(p => p._id === id);

  //     if (!product) return;

  //     document.getElementById("deleteProductId").value = product._id;
  //     document.getElementById("deleteMessage").innerText =
  //       `Are you sure you want to delete "${product.name}"?`;

  //     deleteModal.show();
  //   }
  // });

  // // Confirm Delete
  // document.getElementById("confirmDelete").addEventListener("click", async () => {
  //   const id = document.getElementById("deleteProductId").value;
  //   const token = localStorage.getItem("key");

  //   try {
  //     const res = await fetch(`http://localhost:3001/amazon/document/api/products/${id}`, {
  //       method: "DELETE",
  //       headers: { "Authorization": `Bearer ${token}` }
  //     });
  //     const result = await res.json();

  //     if (result.success) {
  //       Swal.fire({ icon: "success", text: "Product deleted successfully!" });
  //       deleteModal.hide();
  //       products = products.filter(p => p._id !== id);
  //       filteredProducts = filteredProducts.filter(p => p._id !== id);
  //       renderTable();
  //     } else {
  //       Swal.fire({ icon: "error", text: result.message || "Failed to delete product" });
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     Swal.fire({ icon: "error", text: "Server error during deletion" });
  //   }
  // });
let allUsers = [];
let currentPage = 1;

async function loadAllUsers() {
  const tableBody = document.querySelector("table tbody");
  const spinner = document.getElementById("loadingSpinner");
  const pagination = document.getElementById("pagination");

  spinner.style.display = "block";
  tableBody.innerHTML = "";
  pagination.innerHTML = "";

  try {
    const res = await fetch("http://localhost:3001/amazon/document/api/register");
    if (!res.ok) throw new Error("Failed to fetch users");

    allUsers = await res.json();
    spinner.style.display = "none";
    renderUsers();
  } catch (error) {
    spinner.style.display = "none";
    console.error(error);
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading users ❌</td></tr>`;
  }
}

// ✅ Render filtered users
function renderUsers() {
  const tableBody = document.querySelector("table tbody");
  const pagination = document.getElementById("pagination");
  const searchInput = document.getElementById("searchInput");
  const pageSize = parseInt(document.getElementById("pageSize").value);
  const filterSelect = document.getElementById("filterSelect");

  let filteredUsers = allUsers;

  // 🔍 Search filter (name or email)
  const search = searchInput.value.trim().toLowerCase();
  if (search) {
    filteredUsers = filteredUsers.filter(u =>
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search))
    );
  }

  // 🎚️ Role filter
  const selectedRole = filterSelect ? filterSelect.value.toLowerCase() : "";
  if (selectedRole && selectedRole !== "all") {
    filteredUsers = filteredUsers.filter(
      u => u.role && u.role.toLowerCase() === selectedRole
    );
  }

  // 📄 Pagination
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const usersToShow = filteredUsers.slice(start, end);

  // 🧹 Clear table
  tableBody.innerHTML = "";

  if (!usersToShow.length) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No users found.</td></tr>`;
    pagination.innerHTML = "";
    return;
  }

  // 🧍 Render rows
  usersToShow.forEach(user => {
    let roleBadge = "";
    switch ((user.role || "").toLowerCase()) {
      case "super_admin":
        roleBadge = `<span class="badge bg-success">Super Admin</span>`;
        break;
      case "distributor":
        roleBadge = `<span class="badge bg-primary">Distributor</span>`;
        break;
      case "customer":
        roleBadge = `<span class="badge bg-warning text-dark">Customer</span>`;
        break;
      default:
        roleBadge = `<span class="badge bg-secondary">${user.role || "Unknown"}</span>`;
    }

    tableBody.insertAdjacentHTML(
      "beforeend",
      `
        <tr>
          <td>${user.name || "N/A"}</td>
          <td>${user.phoneNumber || "N/A"}</td>
          <td>${user.email || "N/A"}</td>
          <td>${user.country || "N/A"}</td>
          <td>${user.state || "N/A"}</td>
          <td>${user.city || "N/A"}</td>
          <td>${roleBadge}</td>
        </tr>
      `
    );
  });

  // 🔢 Pagination buttons
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    pagination.insertAdjacentHTML(
      "beforeend",
      `
        <li class="page-item ${i === currentPage ? "active" : ""}">
          <button class="page-link" onclick="goToPage(${i})">${i}</button>
        </li>
      `
    );
  }
}

// ✅ Change page
function goToPage(page) {
  currentPage = page;
  renderUsers();
}

// ✅ Initialize and add event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadAllUsers();

  // Search event
  document.getElementById("searchInput").addEventListener("input", () => {
    currentPage = 1;
    renderUsers();
  });

  // Role filter
  const filterSelect = document.getElementById("filterSelect");
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      currentPage = 1;
      renderUsers();
    });
  }

  // Page size change
  document.getElementById("pageSize").addEventListener("change", () => {
    currentPage = 1;
    renderUsers();
  });
});

// document.addEventListener("DOMContentLoaded", () => {
//   const userImgEl = document.getElementById("userImage");
//   const userNameEl = document.getElementById("userName");

//   // Try to get user info from localStorage
//   const savedUser = localStorage.getItem("key") ;

//   if (savedUser) {
//     const userData = JSON.parse(savedUser);

//     // 🧑 Display name
//     userNameEl.textContent = userData.name || userData.firstName || "Super Admin";

//     // 🖼️ Display image or default
//     userImgEl.src = userData.image && userData.image.trim() !== ""
//       ? userData.image
//       : "https://cdn-icons-png.flaticon.com/512/847/847969.png"; // default avatar
//   } else {
//     // 💤 Fallback for when no user info found
//     userNameEl.textContent = "Guest User";
//     userImgEl.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
//   }
// });



//  ORDERS OVER TIME ON DASHBOARD
 document.addEventListener("DOMContentLoaded", async () => {
    const ctx = document.getElementById("ordersOverTimeChart").getContext("2d");
    const monthSelect = document.getElementById("monthSelect");
    const compareToggle = document.getElementById("compareToggle");
    const summary = document.getElementById("monthlySummary");
    let allOrders = [];
    let chart;
    // :white_check_mark: Fetch all orders (real data)
    async function fetchOrders() {
      try {
        const res = await fetch("http://localhost:3001/amazon/document/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        allOrders = data;
        populateMonthDropdown();
        renderChart();
      } catch (err) {
        console.error(":x: Error fetching orders:", err);
      }
    }
    // :white_check_mark: Build month dropdown dynamically
    function populateMonthDropdown() {
      const months = [...new Set(
        allOrders.map(o => {
          const d = new Date(o.createdAt);
          return d.toLocaleString("default", { month: "long", year: "numeric" });
        })
      )];
      months.forEach(month => {
        const opt = document.createElement("option");
        opt.value = month;
        opt.textContent = month;
        monthSelect.appendChild(opt);
      });
    }
    // :white_check_mark: Compute daily paid/pending stats
    function getOrdersData(monthLabel = "") {
      const now = new Date();
      let filtered = allOrders;
      if (monthLabel) {
        filtered = allOrders.filter(o => {
          const d = new Date(o.createdAt);
          return d.toLocaleString("default", { month: "long", year: "numeric" }) === monthLabel;
        });
      } else {
        filtered = allOrders.filter(o => {
          const d = new Date(o.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
      }
      const daily = {};
      filtered.forEach(order => {
        const d = new Date(order.createdAt);
        const day = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
        if (!daily[day]) daily[day] = { paidCount: 0, pendingCount: 0, paidRevenue: 0, pendingRevenue: 0 };
        if (order.paymentStatus?.toLowerCase() === "paid") {
          daily[day].paidCount += 1;
          daily[day].paidRevenue += order.totalAmount || 0;
        } else {
          daily[day].pendingCount += 1;
          daily[day].pendingRevenue += order.totalAmount || 0;
        }
      });
      return {
        days: Object.keys(daily),
        paidCounts: Object.values(daily).map(d => d.paidCount),
        pendingCounts: Object.values(daily).map(d => d.pendingCount),
        paidRevenue: Object.values(daily).map(d => d.paidRevenue),
        pendingRevenue: Object.values(daily).map(d => d.pendingRevenue),
        totals: {
          paidOrders: Object.values(daily).reduce((a,b)=>a+b.paidCount,0),
          pendingOrders: Object.values(daily).reduce((a,b)=>a+b.pendingCount,0),
          paidRevenue: Object.values(daily).reduce((a,b)=>a+b.paidRevenue,0),
          pendingRevenue: Object.values(daily).reduce((a,b)=>a+b.pendingRevenue,0),
        }
      };
    }
    // :white_check_mark: Render chart (with paid vs pending)
    function renderChart(selectedMonth = "", compare = false) {
      const current = getOrdersData(selectedMonth);
      const prevMonthLabel = compare ? getPrevMonth(selectedMonth) : null;
      const previous = compare ? getOrdersData(prevMonthLabel) : null;
      if (chart) chart.destroy();
      const datasets = [
        {
          label: "Paid Orders",
          data: current.paidCounts,
          borderColor: "#198754",
          backgroundColor: "rgba(25, 135, 84, 0.15)",
          fill: true,
          tension: 0.3,
          yAxisID: "yOrders",
        },
        {
          label: "Pending Orders",
          data: current.pendingCounts,
          borderColor: "#FFC107",
          backgroundColor: "rgba(255, 193, 7, 0.15)",
          fill: true,
          tension: 0.3,
          yAxisID: "yOrders",
        },
        {
          label: "Paid Revenue (₦)",
          data: current.paidRevenue,
          borderColor: "#0D6EFD",
          backgroundColor: "rgba(13, 110, 253, 0.15)",
          fill: true,
          tension: 0.3,
          yAxisID: "yRevenue",
        },
        {
          label: "Pending Value (₦)",
          data: current.pendingRevenue,
          borderColor: "#FD7E14",
          backgroundColor: "rgba(253, 126, 20, 0.15)",
          fill: true,
          tension: 0.3,
          yAxisID: "yRevenue",
        }
      ];
      if (compare && previous) {
        datasets.push({
          label: `Prev Month Paid Orders (${prevMonthLabel})`,
          data: previous.paidCounts,
          borderColor: "#6C757D",
          borderDash: [5, 5],
          tension: 0.3,
          yAxisID: "yOrders"
        });
      }
      chart = new Chart(ctx, {
        type: "line",
        data: { labels: current.days, datasets },
        options: {
          responsive: true,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  if (ctx.dataset.label.includes("₦"))
                    return ` ${ctx.dataset.label}: ₦${ctx.parsed.y.toLocaleString()}`;
                  return ` ${ctx.dataset.label}: ${ctx.parsed.y} orders`;
                }
              }
            }
          },
          scales: {
            x: { grid: { display: false } },
            yOrders: {
              position: "left",
              title: { display: true, text: "Orders", color: "#000" },
              beginAtZero: true,
            },
            yRevenue: {
              position: "right",
              title: { display: true, text: "Revenue (₦)", color: "#000" },
              beginAtZero: true,
              grid: { drawOnChartArea: false },
            }
          }
        }
      });
      // :white_check_mark: Summary totals below chart
      summary.innerHTML = `
        <span class="text-success fw-semibold">Paid Orders:</span> ${current.totals.paidOrders.toLocaleString()}
        (₦${current.totals.paidRevenue.toLocaleString()})
        &nbsp; | &nbsp;
        <span class="text-warning fw-semibold">Pending Orders:</span> ${current.totals.pendingOrders.toLocaleString()}
        (₦${current.totals.pendingRevenue.toLocaleString()})
      `;
    }
    // :white_check_mark: Get previous month label
    function getPrevMonth(label) {
      const d = label ? new Date(label) : new Date();
      d.setMonth(d.getMonth() - 1);
      return d.toLocaleString("default", { month: "long", year: "numeric" });
    }
    // Events
    monthSelect.addEventListener("change", (e) => {
      renderChart(e.target.value, compareToggle.checked);
    });
    compareToggle.addEventListener("change", () => {
      renderChart(monthSelect.value, compareToggle.checked);
    });
    fetchOrders();
  });







