let credVal = () => {
  // Input Fields
  let byrName = document.csales.byrname;
  let nin = document.csales.nin;
  let location = document.csales.location;
  let tel = document.csales.telno;
  let type = document.csales.pdtype;
  let pdtName = document.csales.prodname;
  let agtName = document.csales.agtname;

  // Error Fields
  let errByrName = document.querySelector('#errByrName');
  let errNin = document.querySelector('#errNin');
  let errLocation = document.querySelector('#errLocation');
  let errProdType = document.querySelector('#errProdType');
  let errProdName = document.querySelector('#errProdName');
  let errAgtName = document.querySelector('#errAgtName');
  let errTelNo = document.querySelector('#errTelNo');

  // Regexp
  let num = /^[0-9]+$/;
  let alpnum = /^[a-zA-Z0-9-.,\s]+$/;
  let ninExp = /^[A-Z0-9]+$/;

  const errStyle = 'font-size:13px; color:red;';
  const bdrStyle = '2px solid red';

  // Buyer's Name
  if (!byrName.value.match(alpnum) && !(byrName.value.length > 2)) {
    byrName.focus();
    byrName.style.border = bdrStyle;
    errByrName.style = errStyle;
    errByrName.innerHTML =
      'Name must be made of more than 2 alphanumeric characters.';
  }

  // NIN Validation
  if (!nin.value.match(ninExp) && nin.value.length !== 14) {
    nin.focus();
    nin.style.border = bdrStyle;
    errNin.style = errStyle;
    errNin.innerHTML = 'NIN is of 14 characters (numbers and capital letters).';
  }

  // Location Validation
  if (!location.value.match(alpnum) && location.value.length < 2) {
    location.focus();
    location.style.border = bdrStyle;
    errLocation.style = errStyle;
    errLocation.innerHTML =
      'Location must be made of more than 2 alphanumeric characters.';
  }

  // Validating Contact field.
  if (tel.value.length !== 10 && !tel.value.match(num)) {
    tel.style.border = bdrStyle;
    tel.focus();
    errTelNo.style = errStyle;
    errTelNo.innerHTML = 'Format: 0701234567';
  }

  // Produce Type Validation
  if (type.value == '') {
    type.focus();
    type.style.border = bdrStyle;
    errProdType.style = errStyle;
    errProdType.innerHTML = 'You must choose an option.';
  }

  // Produce Name Validation
  if (pdtName.value == '') {
    pdtName.focus();
    pdtName.style.border = bdrStyle;
    errProdName.style = errStyle;
    errProdName.innerHTML = 'You must choose an option.';
  }

  // Sales Agent's Name Validation
  if (!agtName.value.match(alpnum) && agtName.value.length < 3) {
    agtName.focus();
    agtName.style.border = bdrStyle;
    errAgtName.style = errStyle;
    errAgtName.innerHTML = `Name must be made of more than 3 alphanumeric characters.`;
  }

  Event.preventDefault();
};
