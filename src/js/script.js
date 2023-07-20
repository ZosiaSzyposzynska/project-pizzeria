/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product', // CODE ADDED
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input.amount', // CODE CHANGED
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
  // CODE ADDED START
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
  // CODE ADDED END
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  // CODE ADDED START
  cart: {
    wrapperActive: 'active',
  },
  // CODE ADDED END
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  }, // CODE CHANGED
  // CODE ADDED START
  cart: {
    defaultDeliveryFee: 20,
  },
  // CODE ADDED END
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  // CODE ADDED START
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
};

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.productSummary = {};
      

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderFrom();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.prepareCartProduct();

      console.log('newProduct:', thisProduct);

    }

  

    renderInMenu(){
      
      const thisProduct = this;
      console.log(thisProduct);

      /* generate HTML based on template */

      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */

      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */

      menuContainer.appendChild(thisProduct.element);

    }

    getElements(element){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem  = thisProduct.element.querySelector(select.menuProduct.amountWidget);

      thisProduct.dom = {};
      thisProduct.dom.wrapper = element;
    }





   initAccordion(){
    
    const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */

      const activeProduct = document.querySelector('.product.active');
      

      /* if there is active product and it's not thisProduct.element, remove class active from it */
    
        if (activeProduct !== null && activeProduct !== thisProduct.element){
          activeProduct.classList.remove('active');
        }
      
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');

    });

  }

  initOrderFrom(){
    const thisProduct = this;
    console.log('initOrderFrom:',thisProduct);

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      
    });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });


  }

  addToCart() {
    const thisProduct = this;
    thisProduct.processOrder();
    const productSummary = thisProduct.prepareCartProduct(); 
    app.cart.add(productSummary); 
  }


   initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  

  thisProduct.amountWidgetElem.addEventListener('updated', function(event){
     event.preventDefault();
      thisProduct.processOrder();
      
    });

  }

   


  processOrder(){
    const thisProduct = this;
    console.log('processOrder:', thisProduct);

    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData:', formData);

     // set price to default price
    let price = thisProduct.data.price;

  // for every category (param)...
    for(let paramId in thisProduct.data.params) {
    // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      console.log(paramId, param);

    // for every option in this category
    for(let optionId in param.options) {
      // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
      const option = param.options[optionId];
      console.log(optionId, option);

     
 // check if the option is selected
      if(formData[paramId].includes(optionId) && !option.default) { 
        price += option.price;
      }
      // if we deselect an option that is the default, reduce the price
      if(!formData[paramId].includes(optionId) && option.default){
        price -= option.price;
      }
      // find images
      const imgOption = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
      // if opction is selected, add class 'active'
      if (imgOption) {
      if (formData[paramId] && formData[paramId].includes(optionId)) {
        imgOption.classList.add(classNames.menuProduct.imageVisible);
        } else {
      // remove class 'active' if option is not selected
        imgOption.classList.remove(classNames.menuProduct.imageVisible);
        }
      }


    }
  }

  thisProduct.priceSingle = price;
  price *= thisProduct.amountWidget.value;
  // update calculated price in the HTML
  thisProduct.priceElem.innerHTML = price;

  }
 
 prepareCartProduct(){
  const thisProduct = this;
  thisProduct.productSummary.id = thisProduct.id; 
  thisProduct.productSummary.name = thisProduct.data.name; 
  thisProduct.productSummary.amount = thisProduct.amountWidget.value; 
  thisProduct.productSummary.priceSingle = thisProduct.priceSingle;
  thisProduct.productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

  thisProduct.productSummary.params = thisProduct.prepareCartProductParams();

  return thisProduct.productSummary;
 }

  prepareCartProductParams() {
  const thisProduct = this;
  const formData = utils.serializeFormToObject(thisProduct.form);
  const params = {};

  // for every category (param)...
  for (let paramId in thisProduct.data.params) {
    const param = thisProduct.data.params[paramId];

    params[paramId] = {
      label: param.label,
      options: {}
    };

    // for every option in this category
    for (let optionId in param.options) {
      const option = param.options[optionId];
      const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

      if (optionSelected) {
        params[paramId].options[optionId] = option.label; 
      }
    }
  }

  return params;
  }
}
 
  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
      
    }


   getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

    
}

  initActions(){
    const thisWidget = this;
    

    thisWidget.input.addEventListener('change', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
    
     thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
    });




  }

   announce() {
    const thisWidget = this;
    const event = new Event('updated');
    thisWidget.element.dispatchEvent(event);
  }

  

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);

    /* TODO: ADD VALIDATION */

    thisWidget.value = newValue;
    thisWidget.input.value = thisWidget.value;

    /* check if the value is diffetent from what it is already in thisWidget.value and if newValue is not null*/

    if(thisWidget.value !== newValue && !isNaN(newValue)){
      
      thisWidget.value = newValue;
      
      
   
    } else if (newValue <= settings.amountWidget.defaultMin) {
      
      thisWidget.value = settings.amountWidget.defaultMin;
      
    } else if (newValue >= settings.amountWidget.defaultMax) {
    
      thisWidget.value = settings.amountWidget.defaultMax;
      
    } 
    
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
    
  
  }
}


  class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart',thisCart);
      
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
     
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    
    }

    add(menuProduct){
      const thisCart = this;
      console.log('ading product', menuProduct);

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);

    }


  }



  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart); 
      thisApp.cart = new Cart(cartElem);
    }

  };

  
  app.init();

 
  
}
