const API = new Api("ibragimova-angelina");

let addBtn = document.querySelector("#add");
let authBtn = document.querySelector("#auth");
let editBtn = document.querySelector("#edit");
let deleteBtn = document.querySelector("#delete")

let popupForm = document.querySelector("#popup-form");
let popupFormAuth = document.querySelector("#popup-form-auth");
let popupInfoCat = document.querySelector("#popup-info-cat");

let closePopupForm = popupForm.querySelector(".popup-close");
let closePopupFormAuth = popupFormAuth.querySelector(".popup-close-auth");
let closePopupInfoCats = popupInfoCat.querySelector(".popup-close-info-cat")

let form = document.forms[0]; // form add
let formAuth = document.forms[1]; // form authorization
let formEdit = document.forms[2]; // form edit

let main = document.querySelector("main");

// cats.forEach(function (cat) {
//   // let card = `<div class="card" style="background-image: url(${cat.img_link})">
//   // <span>${cat.name}</span>
//   // </div>`;

//   let card = `<div class="${
//     cat.favourite ? "card like" : "card"
//   }" style="background-image: url(${cat.img_link})">
//     <span>${cat.name}</span>
//     </div>`;

//   main.innerHTML += card;
// });


let cards = document.getElementsByClassName("card");

for (let i = 0, cnt = cards.length; i < cnt; i++) {
  const width = cards[i].offsetWidth;
  cards[i].style.height = width * 0.6 + "px";
}

//обработка события добавления котиков
addBtn.addEventListener("click", (e) => {
  if (!userInCookies()) {
    alert('Вы не авторизованы!')
    return
  }
  e.preventDefault();
  if (!popupForm.classList.contains("active")) {
    popupForm.classList.add("active");
    popupForm.parentElement.classList.add("active");
  }
});

 function userInCookies() {
  return Cookies.get('user') !== undefined;
 }

//открытие авторизации
authBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!popupFormAuth.classList.contains("active")) {
    popupFormAuth.classList.add("active");
    popupFormAuth.parentElement.classList.add("active");
  }
});

deleteBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let body = getFormBody(formEdit);
  console.log(body)
  API.delCat(body.id)
  .then((res) => res.json())
  .then((data) => {
    if (data.message === "ok") {
      catsData = catsData.filter(cat => cat.id != body.id)
      localStorage.setItem("cats", JSON.stringify(catsData));
      getCats(API, catsData);  // получили всех котов
      closePopup(popupInfoCat);
    }
  });
})

editBtn.addEventListener("click", (e) => {
  e.preventDefault();
  makeFormEditable(true)
});


closePopupForm.addEventListener("click", () => {
  closePopup(popupForm)
});

closePopupInfoCats.addEventListener("click", () => {
  closePopup(popupInfoCat)
});

//закрытие авторизации
closePopupFormAuth.addEventListener("click", () => {
  closePopup(popupFormAuth)
});

function closePopup(popup) {
  popup.classList.remove("active");
  popup.parentElement.classList.remove("active");
}

form.img_link.addEventListener("change", (e) => {
  form.firstElementChild.style.backgroundImage = `url(${e.target.value})`;
});
formEdit.img_link.addEventListener("change", (e) => {
  formEdit.firstElementChild.style.backgroundImage = `url(${e.target.value})`;
});
form.img_link.addEventListener("input", (e) => {
  form.firstElementChild.style.backgroundImage = `url(${e.target.value})`;
});
formEdit.img_link.addEventListener("input", (e) => {
  formEdit.firstElementChild.style.backgroundImage = `url(${e.target.value})`;
});

function getFormBody(form) {
  let body = {};
  for (let i = 0; i < form.elements.length; i++) {
    let inp = form.elements[i];
    if (inp.type === "checkbox") {
      body[inp.name] = inp.checked;
    } else if (inp.name && inp.value) {
      if (inp.type === "number") {
        body[inp.name] = +inp.value;
      } else {
        body[inp.name] = inp.value;
      }
    }
  }
  return body;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let body = getFormBody(form);
  console.log(body);

  API
  .addCat(body)   // добавили
  .then((res) => res.json())
  .then((data) => {
    if (data.message === "ok") {
      form.reset();
      closePopupForm.click();
      API
        .getCat(body.id) // получили
        .then((res) => res.json())
        .then((cat) => {
          if (cat.message === "ok") {
            catsData.push(cat.data);
            localStorage.setItem("cats", JSON.stringify(catsData));
            getCats(API, catsData);  // получили всех котов
          } else {
            console.log(cat);
          }
        });
    } else {
      console.log(data);
      API
        .getIds()
        .then((r) => r.json())
        .then((d) => console.log(d));
    }
  });
});

formAuth.addEventListener("submit", (e) => {
  e.preventDefault();
  let user = formAuth.elements['user'].value
  let password = formAuth.elements['password'].value
  Cookies.set('user', user)
  Cookies.set('password', password)
  closePopup(popupFormAuth);
});

formEdit.addEventListener("submit", (e) => {
  e.preventDefault();
  let body = getFormBody(formEdit);
  API.updCat(body.id, body)
  .then((res) => res.json())
  .then((data) => {
    if (data.message === "ok") {
      console.log("Cat is updated.")
      API
        .getCat(body.id) // получили
        .then((res) => res.json())
        .then((cat) => {
          if (cat.message === "ok") {
            catsData = catsData.filter(cat => cat.id != body.id)
            catsData.push(cat.data);
            localStorage.setItem("cats", JSON.stringify(catsData));
            getCats(API, catsData);  // получили всех котов
            closePopup(popupInfoCat)
          } else {
            console.log(cat);
          }
        });
      // TODO: add cat to localstorage for optimization
    }
  });
})

setInterval(() => {
    authBtn.innerHTML = userInCookies()
    ? 'Добро пожаловать: ' + Cookies.get('user')
    : 'Авторизация';
}, "200")


const updCards = function (data) {
  main.innerHTML = "";
  data.forEach(function (cat) {
    if (cat.id) {
      let card = `<div id="${cat.id}" class="${
        cat.favourite ? "card like" : "card"
      }" style="background-image:  url(${cat.img_link || "images/cat.jpg"})"> 
    <span id="${cat.id}">${cat.name}</span> 
    </div>`;
      main.innerHTML += card;
    }
  });
  let cards = document.getElementsByClassName("card");
  for (let i = 0, cnt = cards.length; i < cnt; i++) {
    const width = cards[i].offsetWidth;
    cards[i].style.height = width * 0.6 + "px";
  }
};

let catsData = localStorage.getItem("cats");
catsData = catsData ? JSON.parse(catsData) : [];

const getCats = function (API, store) {
  if (!store.length) {
    API
      .getCats()
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message === "ok") {
          localStorage.setItem("cats", JSON.stringify(data.data));
          catsData = [...data.data];
          updCards(data.data);
          addOnClickToCard();
        }
      });
  } else {
    updCards(store);
    addOnClickToCard();
  }
};

function addOnClickToCard() {
  for(i = 0; i < cards.length; i++) {
    cards[i].addEventListener("click", displayOneCatInPopup)
  }
}

function displayOneCatInPopup(e) {
  if (!userInCookies()) {
    alert('Вы не авторизованы!')
    return
  }
  makeFormEditable(false);
  formEdit.reset();
  console.log(e.target)
  console.log(e.target.id)
  API.getCat(e.target.id)
  .then((res) => res.json())
  .then(data => {
    let cat = data.data
    formEdit.firstElementChild.style.backgroundImage = `url(${cat.img_link})`
    formEdit.elements['id'].setAttribute('value', cat.id)
    formEdit.elements['age'].setAttribute('value', cat.age)
    formEdit.elements['name'].setAttribute('value', cat.name)
    formEdit.elements['rate'].setAttribute('value', cat.rate)
    formEdit.elements['description'].value = cat.description
    formEdit.elements['favourite'].checked = cat.favourite == true
    formEdit.elements['img_link'].setAttribute('value', cat.img_link)
  
    if (!popupInfoCat.classList.contains("active")) {
      popupInfoCat.classList.add("active");
      popupInfoCat.parentElement.classList.add("active");
    }
  })
}

function makeFormEditable(value) {
  value = !value
  formEdit.elements['age'].disabled = value
  formEdit.elements['name'].disabled = value
  formEdit.elements['rate'].disabled = value
  formEdit.elements['description'].disabled = value
  formEdit.elements['favourite'].disabled = value
  formEdit.elements['img_link'].disabled = value
  formEdit.edit_btn.hidden = value;
}

getCats(API, catsData);
