import { classNames, templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';




 
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

      

    }

  

    renderInMenu(){
      
      const thisProduct = this;
      

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
 
  //app.cart.add(productSummary);
  const event = new CustomEvent('add-to-cart', {
    bubbles: true,
    detail: {
      product: thisProduct.prepareCartProduct(),
    },
  });
    thisProduct.element.dispatchEvent(event);
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
    

    const formData = utils.serializeFormToObject(thisProduct.form);
    

     // set price to default price
    let price = thisProduct.data.price;

  // for every category (param)...
    for(let paramId in thisProduct.data.params) {
    // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
    

    // for every option in this category
    for(let optionId in param.options) {
      // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
      const option = param.options[optionId];
      

     
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


export default Product;