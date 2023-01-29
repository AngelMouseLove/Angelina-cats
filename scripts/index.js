let main = document.querySelector("main");

cats.forEach(function (cat) {
  // let card = `<div class="card" style="background-image: url(${cat.img_link})">
  // <span>${cat.name}</span>
  // </div>`;

  let card = `<div class="${
    cat.favourite ? "card like" : "card"
  }" style="background-image: url(${cat.img_link})">
    <span>${cat.name}</span>
    </div>`;

  main.innerHTML += card;
});

let cards = document.getElementsByClassName("card");

for (let i = 0, cnt = cards.length; i < cnt; i++) {
  const width = cards[i].offsetWidth;
  cards[i].style.height = width * 0.6 + "px";
}

let addBtn = document.querySelector("#add");

let authBtn = document.querySelector("#auth");

let popupForm = document.querySelector("#popup-form");

let popupFormAuth = document.querySelector("#popup-form-auth");

let closePopupForm = popupForm.querySelector(".popup-close");

let closePopupFormAuth = popupFormAuth.querySelector(".popup-close-auth");

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


closePopupForm.addEventListener("click", () => {
  popupForm.classList.remove("active");
  popupForm.parentElement.classList.remove("active");
});

//закрытие авторизации
closePopupFormAuth.addEventListener("click", () => {
  closeAuthPopup();
});

function closeAuthPopup() {
  popupFormAuth.classList.remove("active");
  popupFormAuth.parentElement.classList.remove("active");
}


const api = new Api("ibragimova-angelina");

let form = document.forms[0];
form.img_link.addEventListener("change", (e) => {
  form.firstElementChild.style.backgroundImage = `url(${e.target.value})`;
});
form.img_link.addEventListener("input", (e) => {
  form.firstElementChild.style.backgroundImage = `url(${e.target.value})`;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
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

  console.log(body);

  api
  .addCat(body)
  .then((res) => res.json())
  .then((data) => {
    if (data.message === "ok") {
      form.reset();
      closePopupForm.click();
      api
        .getCat(body.id)
        .then((res) => res.json())
        .then((cat) => {
          if (cat.message === "ok") {
            catsData.push(cat.data);
            localStorage.setItem("cats", JSON.stringify(catsData));
            getCats(api, catsData);
          } else {
            console.log(cat);
          }
        });
    } else {
      console.log(data);
      api
        .getIds()
        .then((r) => r.json())
        .then((d) => console.log(d));
    }
  });
});

// обработка события войти
let formAuth = document.forms[1];

formAuth.addEventListener("submit", (e) => {
  e.preventDefault();
  let user = formAuth.elements['user'].value
  let password = formAuth.elements['password'].value
  Cookies.set('user', user)
  Cookies.set('password', password)
  closeAuthPopup();
  authBtn.innerHTML = 'Добро пожаловать: ' + Cookies.get('user');
});

setInterval(() => {
  if (userInCookies) {
    authBtn.innerHTML = Cookies.get('user') !== undefined ? 'Добро пожаловать: ' + Cookies.get('user') : 'Авторизация';
  }
}, "200")


const updCards = function (data) {
  main.innerHTML = "";
  data.forEach(function (cat) {
    if (cat.id) {
      let card = `<div class="${
        cat.favourite ? "card like" : "card"
      }" style="background-image:  url(${cat.img_link || "images/cat.jpg"})"> 
    <span>${cat.name}</span> 
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

const getCats = function (api, store) {
  if (!store.length) {
    api
      .getCats()
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message === "ok") {
          localStorage.setItem("cats", JSON.stringify(data.data));
          catsData = [...data.data];
          updCards(data.data);
        }
      });
  } else {
    updCards(store);
  }
};

getCats(api, catsData);
