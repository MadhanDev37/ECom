document.addEventListener("DOMContentLoaded", () => {
    const PROJECT_ROOT = "http://localhost:3000/";
    const productCat = document.getElementById("product-cat");
    const popularelectronicssContainer = document.querySelector(
      ".popular-electronicss-container .swiper-wrapper"
    );
    const latestelectronicssContainer = document.querySelector(
      ".latest-electronicss-container .swiper-wrapper"
    );
    const electronicsCategoriesList = document.querySelector(".electronics-categories-list");
    const brandsList = document.querySelector(".brands-list");
    const minSlider = document.getElementById("min-slider");
    const maxSlider = document.getElementById("max-slider");
    const minPriceDisplay = document.getElementById("min-price");
    const maxPriceDisplay = document.getElementById("max-price");
    const electronicsListContainer = document.querySelector(".electronicslist-container");
    const resetBtn = document.getElementById("reset-btn");
    const applyFilterBtn = document.querySelector(".apply-btn");
    const cartLists = document.querySelector(".cart-lists");
    const emptyCart = document.querySelector(".empty-cart");
    const navCart=document.querySelector('.nav-cart');
    let minPrice = parseInt(
      minPriceDisplay ? minPriceDisplay.textContent : "0",
      10
    );
    let maxPrice = parseInt(
      maxPriceDisplay ? maxPriceDisplay.textContent : "50000",
      10
    );
    if (popularelectronicssContainer) {
      const getHomeelectronicss = async () => {
        try {
          const response = await fetch(`${PROJECT_ROOT}api/products`);
          if (!response.ok)
            throw new Error("Error status code: " + response.status);
          const data = await response.json();
          if(data.status === 200 && data.data.length > 0){
            
            const brandMap = new Map();
            
            data.data.forEach(product => {
              if (product.brand && !brandMap.has(product.brand)) {
                brandMap.set(product.brand, product);
              }
            });
            
            const uniqueBrandProducts = Array.from(brandMap.values());
            
            popularelectronicssContainer.innerHTML = uniqueBrandProducts.map(d => `
                <div class="swiper-slide">
                  <div class="card view-electronics-details" data-electronics-viewid="${d._id}">
                    <div class="card-header">
                      <div class="card-image">
                        <img src="${d.images[0]}" alt="${d.name}" />
                      </div>
                    </div>
                    <div class="card-body">
                      <p title="${d.name}">
                        ${d.name.length > 20 ? d.name.substring(0, 17) + "..." : d.name}
                      </p>
                      <p>₹${d.price.toLocaleString("en-IN")}</p>
                    </div>
                    <div class="card-footer">
                      <button class="addtocart" data-electronics-id="${d._id}">View</button>
                    </div>
                  </div>
                </div>
              `).join("");
            }else{

               `<h1>To be updated</h1>`;
            }
          const viewelectronicsDetails = document.querySelectorAll(".view-electronics-details");
  
          if (viewelectronicsDetails.length > 0) {
            viewelectronicsDetails.forEach((v) => {
              v.addEventListener("click", (event) => {
                let targetElement = event.target;
  
                while (targetElement && !targetElement.dataset.electronicsViewid) {
                  targetElement = targetElement.parentElement;
                }
  
                if (targetElement && targetElement.dataset.electronicsViewid) {
                  const electronicsId = targetElement.dataset.electronicsViewid;
                  console.log("electronics", electronicsId);
  
                  const queryString = `/details?id=${encodeURIComponent(
                    electronicsId
                  )}`;
                  window.location.href = queryString;
                } else {
                  console.error(
                    "electronics ID not found in the target element or its children."
                  );
                }
              });
            });
          }
        } catch (error) {
          console.log("Error:", error);
        }
      };
      getHomeelectronicss();
    }

    // Latest electronicss
    if (latestelectronicssContainer) {
      const getHomeelectronicss = async () => {
        try {
          const response = await fetch(`${PROJECT_ROOT}api/products`);
          if (!response.ok)
            throw new Error("Error status code: " + response.status);
          const data = await response.json();
          latestelectronicssContainer.innerHTML =
            data.status === 200 && data.data.length > 0
              ? data.data
                  .slice(0, 6)
                  .map(
                    (d) => `
                  <div class="swiper-slide">
                    <div class="card view-electronics-details" data-electronics-viewid="${d._id}">
                      <div class="card-header">
                        <div class="card-image"><img src="${
                          d.images[0]
                        }" alt="electronics Image" /></div>
                      </div>
                      <div class="card-body">
                        <p title="${d.name}">${
                            d.name.length > 20
                              ? d.name.substring(0, 17) + "..."
                              : d.name
                          }</p>
                        <p>₹${d.price.toLocaleString("en-IN")}</p>
                      </div>
                      <div class="card-footer">
                        <button id='electronics' class="addtocart" data-electronics-id="${
                          d._id
                        }">View</button>
                      </div>
                    </div>
                  </div
                  </div>
                  `
                  )
                  .join("")
              : `<h1>To be updated</h1>`;
          const viewelectronicsDetails = document.querySelectorAll(".view-electronics-details");
  
          if (viewelectronicsDetails.length > 0) {
            viewelectronicsDetails.forEach((v) => {
              v.addEventListener("click", (event) => {
                let targetElement = event.target;
  
                while (targetElement && !targetElement.dataset.electronicsViewid) {
                  targetElement = targetElement.parentElement;
                }
  
                if (targetElement && targetElement.dataset.electronicsViewid) {
                  const electronicsId = targetElement.dataset.electronicsViewid;
                  console.log("electronics", electronicsId);
  
                  const queryString = `/details?id=${encodeURIComponent(
                    electronicsId
                  )}`;
                  window.location.href = queryString;
                } else {
                  console.error(
                    "electronics ID not found in the target element or its children."
                  );
                }
              });
            });
          }
        } catch (error) {
          console.log("Error:", error);
        }
      };
      getHomeelectronicss();
    }
  
    // Fetch categories and set initial selections from URL params
    if (electronicsCategoriesList) {
      const getCategories = async () => {
        try {
          const response = await fetch(`${PROJECT_ROOT}api/categories`);
          if (!response.ok)
            throw new Error("Error status code: " + response.status);
          const data = await response.json();
          if (data.status === 200 && data.data.length > 0) {

            electronicsCategoriesList.innerHTML = data.data
              .map(
                (d) => `
              <li>
                <input type="checkbox" name="categories" class="categories" id="cbr${d._id}" value="${d._id}" />
                <label for="cbr${d._id}">${d.title}</label>
              </li>`
              )
              .join("");

                  brandsList.innerHTML = data.data
                  .flatMap(category => 
                    category.brands.map(brand => `
                      <li>
                        <input type="checkbox" name="brands" class="brands" id="cbr${brand._id}" value="${brand._id}" />
                        <label for="cbr${brand._id}">${brand.name}</label>
                      </li>
                    `)
                  )
                  .join('');

              
  
            // Set initial selections from URL params
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get("category");
            const keywordParam = urlParams.get("keyword");
            const selectedCategories = categoryParam
              ? categoryParam.split(",")
              : [];
            electronicsCategoriesList.querySelectorAll("input").forEach((input) => {
              if (selectedCategories.includes(input.value)) {
                input.checked = true;
                resetBtn.classList.add("active");
              }
            });
            getelectronicss(selectedCategories, minPrice, maxPrice, keywordParam);
          }else{
            electronicsCategoriesList.innerHTML="No Data found"
          }
        } catch (error) {
          console.log("Error:", error);
        }
      };
      getCategories();
    }
  
    // Price range slider setup
  
    const activeTrack = document.createElement("div");
    activeTrack.classList.add("slider-active");
    const sliderContainer = document.querySelector(".slider-container");
  
    const updateSliderTrack = () => {
      minPrice = parseInt(minSlider.value);
      maxPrice = parseInt(maxSlider.value);
      minPriceDisplay.textContent = minPrice;
      maxPriceDisplay.textContent = maxPrice;
      const minPercent =
        ((minPrice - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
      const maxPercent =
        ((maxPrice - maxSlider.min) / (maxSlider.max - maxSlider.min)) * 100;
      activeTrack.style.left = `${minPercent}%`;
      activeTrack.style.width = `${maxPercent - minPercent}%`;
    };
  
    if (sliderContainer) {
      sliderContainer.appendChild(activeTrack);
      minSlider.addEventListener("input", updateSliderTrack);
      maxSlider.addEventListener("input", updateSliderTrack);
      updateSliderTrack();
    }
  
    // Fetch electronicss based on selected filters
    const getelectronicss = async (
      categories,
      minPrice,
      maxPrice,
      keywordParam = null
    ) => {
      try {
        const response = await fetch(`${PROJECT_ROOT}api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categories,
            payment_range_from: minPrice,
            payment_range_to: maxPrice,
            keyword: keywordParam,
          }),
        });
        if (!response.ok)
          throw new Error("Error status code: " + response.status);
  
        const data = await response.json();
        electronicsListContainer.innerHTML =
          data.status === 200 && data.data.length > 0
            ? data.data
                .map(
                  (d) => `
            <div class="card view-electronics-details"  data-electronics-viewid="${d._id}">
              <div class="card-header">
                <div class="card-image"><img src="${
                  d.images[0]
                }" alt="electronics Image" /></div>
              </div>
              <div class="card-body">
                <p title="${d.name}">${
                    d.name.length > 20
                      ? d.name.substring(0, 17) + "..."
                      : d.name
                  }</p>
                <p>₹${d.price.toLocaleString("en-IN")}</p>
                <button class="addtocart" data-electronics-id="${d._id}">View</button>
              </div>
            </div>`
                )
                .join("")
            : `<h1>No Result Found</h1>`;


        const viewelectronicsDetails = document.querySelectorAll(".view-electronics-details");
  
        if (viewelectronicsDetails.length > 0) {
          viewelectronicsDetails.forEach((v) => {
            v.addEventListener("click", (event) => {
              let targetElement = event.target;
  
              while (targetElement && !targetElement.dataset.electronicsViewid) {
                targetElement = targetElement.parentElement;
              }
  
              if (targetElement && targetElement.dataset.electronicsViewid) {
                const electronicsId = targetElement.dataset.electronicsViewid;
                console.log("electronics", electronicsId);
  
                const queryString = `/details?id=${encodeURIComponent(
                  electronicsId
                )}`;
                window.location.href = queryString;
              } else {
                console.error(
                  "electronics ID not found in the target element or its children."
                );
              }
            });
          });
        }
      } catch (error) {
        console.log("Error:", error);
      }
    };
  
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const selectedCategories = Array.from(
          electronicsCategoriesList.querySelectorAll("input:checked")
        ).map((cb) => cb.value);
        const categoryParams = selectedCategories.join(",");
  
        // Update the URL without reloading the page
        const newUrl = `${window.location.origin}/electronics/lists?category=${categoryParams}`;
        window.history.replaceState({}, "", newUrl);
  
        resetBtn.classList.add("active");
        getelectronicss(selectedCategories, minPrice, maxPrice);
      });
    }
  
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        electronicsCategoriesList
          .querySelectorAll("input")
          .forEach((cb) => (cb.checked = false));
        minPrice = 0;
        maxPrice = 50000;
        resetBtn.classList.remove("active");
        window.history.replaceState({}, "", "/electronics/lists");
        getelectronicss([], minPrice, maxPrice);
        preventBackNavigation();
      });
    }
  
    function preventBackNavigation() {
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", () => {
        window.history.pushState(null, "", window.location.href);
      });
    }
  
    const electronicsSearchBtn = document.getElementById("electronics-search-form");
    if (electronicsSearchBtn) {
      electronicsSearchBtn.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(electronicsSearchBtn);
        const keyword = formData.get("product_title") || "";
        const category = formData.get("product_cat") || "";
        const queryString = `/electronics/lists?keyword=${encodeURIComponent(
          keyword
        )}&category=${encodeURIComponent(category)}`;
        window.location.href = queryString;
      });
    }
    // signup
  
    const signupForm = document.getElementById("signup-form");
    const signupBtn = document.getElementById("signup-btn");
    const username = document.getElementById("username");
    const email = document.getElementById("signemail");
    const password = document.getElementById("signpassword");
    const cpassword = document.getElementById("cpassword");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const loginForm = document.getElementById("login-form");
    const loginBtn = document.getElementById("login-btn");
  
    function setError(input, message, className) {
      inputElement = input.closest(className);
      span = inputElement.querySelector("span");
      span.textContent = message;
      span.classList.add("error-msg");
      input.classList.remove("success-msg");
      input.classList.add("error-msg");
    }
  
    function setSuccess(input, className) {
      inputElement = input.closest(className);
      span = inputElement.querySelector("span");
      span.textContent = "";
      span.classList.remove("error-msg");
      input.classList.remove("error-msg");
      input.classList.add("success-msg");
    }
  
    if (signupForm) {
      signupBtn.addEventListener("click", (e) => {
        e.preventDefault();
  
        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();
        const cpasswordValue = cpassword.value.trim();
  
        let valid = true;
        if (usernameValue === "") {
          setError(username, "Username Field is required", ".signup-form-group");
          valid = false;
        } else {
          setSuccess(username, ".signup-form-group");
        }
        if (emailValue === "") {
          setError(email, "Email Field is required", ".signup-form-group");
          valid = false;
        } else if (!emailRegex.test(emailValue)) {
          setError(email, "Email is invalid", ".signup-form-group");
          valid = false;
        } else {
          setSuccess(email, ".signup-form-group");
        }
        if (passwordValue === "") {
          setError(password, "Password Field is required", ".signup-form-group");
          valid = false;
        } else if (!passwordRegex.test(passwordValue)) {
          setError(
            password,
            "Password needs stronger criteria.",
            ".signup-form-group"
          );
          valid = false;
        } else {
          setSuccess(password, ".signup-form-group");
        }
        if (cpasswordValue === "") {
          setError(
            cpassword,
            "Confirm Password Field is required",
            ".signup-form-group"
          );
          valid = false;
        } else if (cpasswordValue !== passwordValue) {
          setError(
            cpassword,
            "Password does not match the entered password",
            ".signup-form-group"
          );
          valid = false;
        } else {
          setSuccess(cpassword, ".signup-form-group");
        }
        if (valid) {
          signupFormSubmit(signupForm);
        }
      });
  
      const signupFormSubmit = async (form) => {
        try {
          const formData = new FormData(form);
          const response = await fetch(`${PROJECT_ROOT}api/signup`, {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error("Something went wrong");
          }
          const data = await response.json();
          const errorMessage = document.querySelector(
            "#signup-form .errorMessage"
          );
          const successMessage = document.querySelector(
            "#signup-form .successMessage"
          );
          errorMessage.textContent = "";
          successMessage.textContent = "";
          if (data.status !== 201) {
            errorMessage.textContent = data.message;
            setTimeout(() => {
              errorMessage.textContent = "";
            }, 2000);
          } else {
            setTimeout(() => {
              successMessage.textContent = "";
              form.reset();
              form.querySelectorAll("input").forEach((f) => {
                if (f.classList.contains("success-msg")) {
                  f.classList.remove("success-msg");
                } else if (f.classList.contains("error-msg")) {
                  f.classList.remove("error-msg");
                }
              });
            }, 2000);
          }
        } catch (error) {
          console.log("error", error);
        }
      };
      function setupTogglePassword(toggleButtonId, passwordInput) {
        const toggleButton = document.getElementById(toggleButtonId);
        toggleButton.addEventListener("click", () => {
          const eyeFill = toggleButton.querySelector(".eye-fill");
          const eyeSlashFill = toggleButton.querySelector(".eye-slash-fill");
          const isPasswordVisible = eyeFill.classList.toggle("active");
  
          passwordInput.type = isPasswordVisible ? "password" : "text";
          eyeSlashFill.classList.toggle("active");
        });
      }
  
      setupTogglePassword("togglePassword1", password);
      setupTogglePassword("togglePassword2", cpassword);
    }
    if (loginForm) {
      const email = document.getElementById("email");
      const password = document.getElementById("password");
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();
  
        let valid = true;
  
        if (emailValue === "") {
          setError(email, "Email Field is required", ".login-form-group");
          valid = false;
        } else if (!emailRegex.test(emailValue)) {
          setError(email, "Email is invalid", ".login-form-group");
          valid = false;
        } else {
          setSuccess(email, ".login-form-group");
        }
        if (passwordValue === "") {
          setError(password, "Password Field is required", ".login-form-group");
          valid = false;
        } else {
          setSuccess(password, ".login-form-group");
        }
        if (valid) {
          loginFormSubmit(loginForm);
        }
      });
  
      const loginFormSubmit = async (form) => {
        try {
          const formData = new FormData(form);
          const response = await fetch(`${PROJECT_ROOT}auth/login`, {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error("Something went wrong");
          }
          const data = await response.json();
          const errorMessage = document.querySelector(
            "#login-form .errorMessage"
          );
          const successMessage = document.querySelector(
            "#login-form .successMessage"
          );
          errorMessage.textContent = "";
          successMessage.textContent = "";
          if (data.status !== 200) {
            errorMessage.textContent = data.message;
            setTimeout(() => {
              errorMessage.textContent = "";
            }, 2000);
          } else {
            successMessage.textContent = data.message;
              setTimeout(() => {
                formModelReset();
                successMessage.textContent = "";
                loginForm.reset();
                window.location.reload();
              }, 2000)
            // window.location.href = data.redirect_url;
          }
        } catch (error) {
          console.log("error", error);
        }
      };
      function setupTogglePassword(toggleButtonId, passwordInput) {
        const toggleButton = document.getElementById(toggleButtonId);
        toggleButton.addEventListener("click", () => {
          const eyeFill = toggleButton.querySelector(".eye-fill");
          const eyeSlashFill = toggleButton.querySelector(".eye-slash-fill");
          const isPasswordVisible = eyeFill.classList.toggle("active");
  
          passwordInput.type = isPasswordVisible ? "password" : "text";
          eyeSlashFill.classList.toggle("active");
        });
      }
  
      setupTogglePassword("togglePassword", password);
    }
  
    const authUser = document.querySelector(".auth-user");
    const authDropdown = document.querySelector(".auth-dropdown");
    const logoutBtn = document.querySelector("#logout-btn");
  
    if (authUser) {
      authUser.addEventListener("click", (e) => {
        e.stopPropagation();
        authDropdown.classList.toggle("active");
      });
  
      document.addEventListener("click", (e) => {
        if (!authDropdown.contains(e.target) && e.target !== authUser) {
          authDropdown.classList.remove("active");
        }
      });
    }
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        const logoutSubmit = async () => {
          try {
            const response = await fetch(`${PROJECT_ROOT}auth/logout`, {
              method: "POST",
            });
            if (!response.ok) {
              throw new Error("Something went wrong");
            }
            const data = await response.json();
            if (data.status !== 200) {
              console.log("error");
            } else {
              window.location.reload();
            }
          } catch (error) {
            console.log("error", error);
          }
        };
        logoutSubmit();
      });
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    const idParam = urlParams.get("id");
    const qtyBoxes = document.querySelectorAll(".qty-box");
  
    if (pathname.includes("details")) {
      const getelectronicsDetails = async (id) => {
        try {
          const response = await fetch(`${PROJECT_ROOT}api/details`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          });
          if (!response.ok) {
            throw new Error("Something went wrong");
          }
          const product_title = document.getElementById("product-title");
          const product_qty = document.getElementById("product-qty");
          const product_description = document.getElementById("product-description");
          const product_price = document.getElementById("product-price");
          // const electronics_images = document.getElementById("electronics-images");
          const electronics_images = document.querySelector(
            ".electronics_images .swiper-wrapper"
          );

          
          const viewaddtocart = document.getElementById("viewaddtocart");
          const data = await response.json();
          if (data) {
            product_title.textContent = data.data.name;
            product_price.textContent =
              "₹" + data.data.price.toLocaleString("en-IN");
              // product_qty.textContent = data.data.qty;
            product_description.textContent = data.data.description;
            viewaddtocart.setAttribute("data-electronics-id", data.data._id);
            qtyBoxes.forEach((q) => {
              q.setAttribute("data-prodId", data.data._id);
            });


            
            data.data.images.map((p) => {
              const slide = document.createElement('div');
              slide.className = 'swiper-slide';
              slide.innerHTML = `<img src="${p}" alt="Product Cover">`;
              electronics_images.appendChild(slide);
            });
          }
          attachQtyButtons();
        } catch (error) {
          console.log("error", error);
        }
      };
  
      getelectronicsDetails(idParam);
    }
    const authCheck = async () => {
      try {
        const response = await fetch(`${PROJECT_ROOT}auth/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        const data = await response.json();
        return data.isAuthenticated;
      } catch (error) {
        console.log("error", error);
        return false;
      }
    };
    const addToCartApi = async (electronics_id, qty) => {
      try {
        const response = await fetch(`${PROJECT_ROOT}api/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prodId:electronics_id, qty }),
        });
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.log("error", error);
        return false;
      }
    };
  
    const attachQtyButtons = () => {
      qtyBoxes.forEach((qb) => {
        const prodId = qb.getAttribute("data-prodid");
  
        const incBtn = qb.querySelector(".increment-btn");
        const decBtn = qb.querySelector(".decrement-btn");
        const input = qb.querySelector("input");
  
        console.log(incBtn, "qtyboxes");
        const ensureValidValue = () => {
          let value = parseInt(input.value);
          if (isNaN(value) || value <= 0) {
            value = 1;
            input.value = value;
          }
          return value;
        };
  
        input.addEventListener("input", async () => {
          const value = ensureValidValue();
          const cart = await addToCartApi(prodId, value);
        });
  
        incBtn.addEventListener("click", async () => {
          let value = ensureValidValue();
          value += 1;
          input.value = value;
        });
  
        decBtn.addEventListener("click", async () => {
          let value = ensureValidValue();
          if (value > 1) {
            value -= 1;
            input.value = value;
          }
        });
  
        input.addEventListener("blur", ensureValidValue);
      });
    };
  
    const addToCartButtons = document.querySelectorAll(".addtocart");
    if (addToCartButtons.length > 0) {
      addToCartButtons.forEach((atc) => {
        atc.addEventListener("click", async (e) => {
          e.stopPropagation();
          const targetElement = e.currentTarget;
          const electronicsId = targetElement.dataset.electronicsId;
          const qtyInput = document.querySelector(".qty-input");
  
          if (!electronicsId) {
            console.error("No electronics ID found");
            return;
          }
  
          const auth = await authCheck();
  
          if (!auth) {
            alert(
              "You cannot purchase this product. Please log in to continue with your purchase."
            );
          } else {
            const cart = await addToCartApi(electronicsId, qtyInput.value);
            // console.log('cart',electronicsId, qtyInput.value);
            
            if (cart) {
              alert(cart.message);
              window.location.href=PROJECT_ROOT+'/cart'
            }
            
      getCartCount();
            // getCarts();
          }
        });
      });
    }
   
    const fetchCartData = async () => {
      const response = await fetch(`${PROJECT_ROOT}cart/all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
  
      return response.json();
    };
    if (cartLists) {
      const getCarts = async () => {
        try {
          const auth = await authCheck();
          let data;
    
          if (auth) {
            data = await fetchCartData();
            console.log('dfasdfdsa',data.data.length);
            
            cartLists.innerHTML = "";
            
            if (data.data.length > 0) {
              if (emptyCart.classList.contains('active')) {
                emptyCart.classList.remove('active');
              }
    
              let qty = 0;
              let price = 0;
    
              data.data.forEach((d) => {
                qty += parseInt(d.qty);
                price += parseInt(d.price) * parseInt(d.qty);
                cartLists.innerHTML += `
                  <div class="cart">
                    <div class="left">
                      <img src="${d.images[0]}" alt="">
                    </div>
                    <div class="right">
                      <p>${d.title}</p>
                      <p>₹ ${d.price}</p>
                      <p><strong>Qty :</strong> ${d.qty}</p>
                    </div>
                    <button class="remove-btn" data-remove-cart="${d.electronics_id}">Remove</button>
                  </div>`;
              });
    
              cartLists.innerHTML += `
                <div class="cart-order">
                  <div class="left">
                    <p><strong>Total Qty :</strong> ${qty}</p>
                    <p><strong>Total Amount :</strong> ₹ ${price}</p>
                  </div>
                  <div id="card-element"></div>
                  <div class="right">
                    <button class="order-btn" data-order="">Place Order</button>
                  </div>
                </div>`;
    
              const removeBtns = document.querySelectorAll('.remove-btn');
              removeBtns.forEach(rb => {
                rb.addEventListener('click', async (e) => {
                  const electronics_id = e.target.dataset.removeCart;
                  await removeCart(electronics_id);
                  getCartCount();
                  // getCarts();
                });
              });
    
         
              const stripe = Stripe('pk_test_51OIWAOSCwle4Crl13n2ukQkNokyVAk8wkIWnjkPRuFdIVIMQMuWeBQcwBGBfUozmCnIT9QAGlQmeBIr4lpmS3Ax000vDzo9jf7');
              const orderBtn = document.querySelector('.order-btn');
              orderBtn.addEventListener('click', async (event) => {
                  event.preventDefault();
          
                  const response = await fetch(`${PROJECT_ROOT}api/checkout`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body:JSON.stringify(data.data)
                  });
          
                  const clientSecret  = await response.json();
          console.log('clientSecret',clientSecret.id);
          
                  const result = await stripe.redirectToCheckout({
                      sessionId: clientSecret.id, 
                  });
          
                  if (result.error) {
                      console.error(result.error.message);
                  }
              });
  
            } else {
              emptyCart.classList.add('active');
            }
          } else {
            emptyCart.classList.add('active');
          }
    
        } catch (error) {
          console.error("Error:", error);
        }
      };
    
      const removeCart = async (electronics_id) => {
        const response = await fetch(`${PROJECT_ROOT}api/cart`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ electronics_id }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      };
    
      // getCarts();
    }
    
      const getCartCount = async () => {
          try {
              const cartCount = await fetchCartData();
              
              const small = navCart.querySelector('small');
              let qty = 0;
  
              if (cartCount.data && cartCount.data.length > 0) {
                small.classList.add('active');
                cartCount.data.forEach(d => {
                  qty += parseInt(d.qty);
                  });
  
                  small.textContent = qty; 
                } else {
                  small.textContent = ''; 
                  small.classList.remove('active');
              }
          } catch (error) {
              console.error('Error fetching cart data:', error);
          }
      };
  
      getCartCount();
      const urlParams1 = new URLSearchParams(window.location.search);
      const pathname1 = window.location.pathname;
      const session_id = urlParams.get("session_id");
      if(session_id)
      {
        const successPayment = async (session_id) => {
          const response = await fetch(`${PROJECT_ROOT}api/success`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log(data);
        };
      
        successPayment(session_id);
      }
  // }




  // swiper

  const swiper = new Swiper('.popular-electronicss-container', {
    slidesPerView: 3,
    spaceBetween: 30,
    // loop:true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    direction: window.innerWidth <= 760 ? 'vertical' : 'horizontal',
    on: {
      resize: function () {
        swiper.changeDirection(window.innerWidth <= 760 ? 'vertical' : 'horizontal');
      }
    }
  });
  const swiper1 = new Swiper('.latest-electronicss-container', {
    slidesPerView: 3,
    spaceBetween: 30,
    // loop:true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    direction: window.innerWidth <= 760 ? 'vertical' : 'horizontal',
    on: {
      resize: function () {
        swiper.changeDirection(window.innerWidth <= 760 ? 'vertical' : 'horizontal');
      }
    }
  });

  

  const swiper2 = new Swiper(".electronics_images", {
    spaceBetween: 3,
    //  loop:true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
  });
  