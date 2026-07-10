// INITIALISING...
// Produce form
let pdtNameField = document.querySelector("#pdt-name");
let byrNameField = document.querySelector("#dlr-name");
let pdTypeField = document.querySelector("#pd-type");
let pdTimeField = document.querySelector("#pd-time");
let dlrTypeField = document.querySelector("#dlr-type");
let ptelNoField = document.querySelector("#ptel-no");
let tonnageField = document.querySelector('#ton-field')

// Regexp
let letters = /^[A-Za-z\s]+$/;
let num = /^[0-9]+$/;
let alpnum = /^[a-zA-Z0-9-.,\s]+$/;
let ninExp = /^[A-Z0-9]+$/;

// Create Element
let errDiv = document.createElement('p');

// Style Element
errDiv.style.color = 'red';
errDiv.style.fontSize = '13px';
const bdrStyle = '2px solid red';

// PROCUREMENT FORM
// Validating Produce Name
const pdtVal = () => {
  let pdtName = document.produce.prodname;
  if (pdtName.value.match(alpnum)) {
    return true;
  } else {
    pdtName.focus();
    pdtName.style.border = bdrStyle;
    errDiv.textContent = `Name must be made of alphanumeric characters.`;
    pdtNameField.appendChild(errDiv);
  }
};
// Product Time
const timeVal = () => {
  let time = document.produce.prodtime;
  if (time.value == "") {
    time.focus();
    time.style.border = "2px red solid";
    errDiv.textContent = "You must choose an option.";
    pdTimeField.appendChild(errDiv);
    return false;
  }
  return true;
};
// Product Type
const typeVal = () => {
  let type = document.produce.prodtype;
  if (type.value == "") {
    type.focus();
    type.style.border = "2px red solid";
    errDiv.textContent = "You must choose an option.";
    pdTypeField.appendChild(errDiv);
    return false;
  }
  return true;
};
// Dealer Type
const dlrTypeVal = () => {
  let type = document.produce.dlrtype;
  if (type.value == "") {
    type.focus();
    type.style.border = "2px red solid";
    errDiv.textContent = "You must choose an option.";
    dlrTypeField.appendChild(errDiv);
    return false;
  }
  return true;
};
// Tonnage
const tonVal = () => {
  let type = document.produce.dlrtype;
  let tonnage = document.produce.tonnage;
  if (type.value == 'Individual') {
    if (tonnage.value >= 1000) {
      return true
    } else {
      tonnage.focus();
      tonnage.style.border = bdrStyle;
      errDiv.textContent = 'Individuals must supply at least 1000 kgs of produce';
      tonnageField.appendChild(errDiv);
      return false;
    }
  }
  return true;
}

// Validating Dealer's Name
const dlrVal = (min) => {
  let byrName = document.produce.dlrname;
  if (byrName.value.match(alpnum) && byrName.value.length > 2) {
    return true;
  } else {
    byrName.focus();
    byrName.style.border = bdrStyle;
    errDiv.textContent = `Name must be made of more than ${min} alphanumeric characters.`;
    byrNameField.appendChild(errDiv);
    return false;
  }
};
// Validating Contact field.
const ptelNoVal = () => {
  let tel = document.produce.telno;
  let teLen = tel.value.length;

  if (teLen == 10 && tel.value.match(num)) {
    return true;
  } else {
    tel.style.border = bdrStyle;
    tel.focus();
    errDiv.textContent = "Format: 0701234567";
    ptelNoField.appendChild(errDiv);
    return false;
  }
};
