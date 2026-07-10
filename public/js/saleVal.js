// Initialising...
// Sales form
let spdtNameField = document.querySelector('#spdt-name');
let sbyrNameField = document.querySelector('#byr-name');
let agtNameField = document.querySelector('#agt-name');

// Regexp
let letters = /^[A-Za-z ]+$/;
let num = /^[0-9]+$/;
let alpnum = /^[a-zA-Z0-9-., ]+$/;
let ninExp = /^[A-Z0-9]+$/;

// Create Element
let errDiv = document.createElement('p');

// Style Element
errDiv.style.color = 'red';
errDiv.style.fontSize = '13px';
const bdrStyle = '2px solid red';

// SALES FORM
// Validating Produce Name
const spdtVal = () => {
  let pdtName = document.sales.prodname;
  if (pdtName.value == '') {
    pdtName.focus();
    pdtName.style.border = '2px red solid';
    errDiv.textContent = 'You must choose an option.';
    spdtNameField.appendChild(errDiv);
    return false;
  }
};
// Buyer's Name
const byrVal = (min) => {
  let byrName = document.sales.byrname;
  if (byrName.value.match(alpnum) && byrName.value.length > 2) {
    return true;
  } else {
    byrName.focus();
    byrName.style.border = bdrStyle;
    errDiv.textContent = `Name must be made of more than ${min} alphanumeric characters.`;
    sbyrNameField.appendChild(errDiv);
    return false;
  }
};
// Agent's Name
const agtVal = (min) => {
  let agtName = document.sales.agtname;
  if (agtName.value.match(alpnum) && agtName.value.length > 2) {
    return true;
  } else {
    agtName.focus();
    agtName.style.border = bdrStyle;
    errDiv.textContent = `Name must be made of more than ${min} alphanumeric characters.`;
    agtNameField.appendChild(errDiv);
    return false;
  }
};

// Amount Paid
const calcAmtPaid = () => {
  let tonnage = document.sales.tonnage.value;
  let unit = document.sales.unit.value;
  let amount = tonnage * 1 * (unit * 1);
  document.sales.amtpaid.value = amount;
};
