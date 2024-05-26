var storage = [];
var liId = 0;
var spanId = 0;
var noteBtnClicked = 0;

// self invoke function to get elements from local store
(function () {
  if (getItemOnLocalStorage('tasks')) {
    var parsed = JSON.parse(getItemOnLocalStorage('tasks'));
    var max = 0;
    for (var i = 0; i < parsed.length; i++) {
      creatElement(parsed[i]);
      if (parsed[i].id > max) {
        max = parsed[i].id;
      }
    }
    storage = parsed;
    liId = max;
    spanId = max * -1;
  }
})();

// sections events
var domSections = document.getElementsByClassName('tasksSection');
for (var i = 0; i < domSections.length; i++) {
  addEventsTosection(domSections[i]);
}

function addEventsTosection(section) {
  section.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
  section.addEventListener('drop', function (event) {
    if (event.target.className == 'tasksSection') {
      event.target.appendChild(document.getElementById(event.dataTransfer.getData('text')));
      var liSpanId = ((parseInt(event.dataTransfer.getData('text'))) * -1) + '';
      // to change the parent of the element in data
      var elementObj = {
        id: parseInt(event.dataTransfer.getData('text')),
        value: document.getElementById(liSpanId).innerText,
        parent: event.target.id
      }
      storage.push(elementObj);
      // to store data in local storage
      setItemOnLocalStorage('tasks', JSON.stringify(storage));
    }
  });
}

// submite btn function
document.getElementById('submit').addEventListener('click', function (e) {
  if (document.getElementById('userInput').value) {
    e.preventDefault();
    var objData = {
      id: ++liId,
      value: document.getElementById('userInput').value,
      parent: 'inProgress'
    }
    creatElement(objData); // this function create new element and push its data into storage array
    setItemOnLocalStorage('tasks', JSON.stringify(storage));
    document.getElementById('userInput').value = '';
  } else {
    alert('There is no data to be added');
  }
});

// functions to create new element (task)
function creatElement(objData) {
  var obj = {
    id: objData.id,
    value: objData.value,
    parent: objData.parent
  }
  var list = document.createElement('li');
  document.getElementById(obj.parent).appendChild(list);
  createListChildren(list, objData.id);
  document.getElementById(spanId + '').innerText = obj.value;
  list.id = objData.id;
  list.setAttribute('draggable', true);
  list.addEventListener('dragstart', function (event) {
    event.dataTransfer.setData('text', event.target.id);
    for (var i = 0; i < storage.length; i++) {
      if (storage[i].id == event.target.id) {
        storage.splice(i, 1);
      }
    }
  })
  storage.push(obj);
}

function createListChildren(list, id) {
  //create elements
  var paragraph = document.createElement('p');
  var spanCreated = document.createElement('span');
  var icon = document.createElement('i');
  var uList = document.createElement('ul');
  var note = document.createElement('button');
  note.innerText = 'Itens';
  var del = document.createElement('button');
  del.innerText = 'Apagar';

  // set IDs and Classes to them
  spanCreated.id = --spanId;
  icon.className = 'fas fa-angle-down';
  icon.id = 'i' + id;
  uList.className = 'listOptionsWrapper';
  note.className = 'notes';
  del.className = 'delete';

  // add event listener to them
  icon.addEventListener('click', handleIconClick);
  note.addEventListener('click', handleNoteBtnClick);
  del.addEventListener('click', handleDeleteBtnClick);

  // appent each one to parent
  list.appendChild(paragraph);
  list.appendChild(uList);
  paragraph.appendChild(spanCreated);
  paragraph.appendChild(icon);
  uList.appendChild(note);
  uList.appendChild(del);
}

// functions to set and get elements from local store

function setItemOnLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function getItemOnLocalStorage(key) {
  return localStorage.getItem(key)
}

// ----------------------------------------------------------------
// note and delete functions
// ----------------------------------------------------------------

// function to display ul list or hide it (togle)
function handleIconClick(e) {
  var uList = document.getElementById(e.target.id).parentElement.nextSibling;
  if (e.target.className == 'fas fa-angle-down') {
    e.target.className = 'fas fa-angle-up';
    uList.style.display = 'block';
    uList.style.zIndex = '1';
  } else {
    e.target.className = 'fas fa-angle-down';
    uList.style.display = 'none';
    uList.style.zIndex = '0';
  }
}

// ------------------------------------------------------
// ------------------------------------------------------

function handleNoteBtnClick(e) {
  // close the ul of buttons 
  var icon = e.target.parentElement.parentElement.children[0].children[1];
  icon.className = 'fas fa-angle-down';
  var uList = e.target.parentElement;
  uList.style.display = 'none';
  uList.style.zIndex = '0';

  // save which element clicked
  noteBtnClicked = e.target.parentElement.parentElement.id;

  // if this element has previous note --> display it
  for (var i = 0; i < storage.length; i++) {
    if (storage[i].id == noteBtnClicked && storage[i].note) {
      document.getElementById('description').value = storage[i].note;
    }
  }

  // make note section appear and be stable after that
  document.getElementById('descrpContainer').style.animationName = 'show';
  setTimeout(function () {
    document.getElementById('descrpContainer').style.maxHeight = '90vh';
  }, 1800);

  // gave the background grey overlay
  document.getElementsByTagName('main')[0].className = 'mainAfter';
}

// ------------------------------------------------------
// ------------------------------------------------------

function handleDeleteBtnClick(e) {
  var confirmation = confirm('Você realmente deseja apagar?')
  if (confirmation) {
    var targetId = e.target.parentElement.parentElement.id;
    var newStorage = [];

    // delete from storage array
    for (var i = 0; i < storage.length; i++) {
      if (storage[i].id != targetId) {
        newStorage.push(storage[i]);
      }
    }
    storage = newStorage;
    // delete from local storage
    setItemOnLocalStorage('tasks', JSON.stringify(storage));

    // delete from dom tree
    document.getElementById(targetId).remove();
  }
}

// ------------------------------------------------------
// save and cancel btns listeners
// ------------------------------------------------------

document.getElementById('cancel').addEventListener('click', cancelNoteHandler);
document.getElementById('save').addEventListener('click', saveNoteHandler);

function cancelNoteHandler() {

  // empty the note text area
  setTimeout(function () {
    document.getElementById('description').value = '';
  }, 2000);

  // make note section disapear
  document.getElementById('descrpContainer').style.animationName = 'hide';
  setTimeout(function () {
    document.getElementById('descrpContainer').style.maxHeight = '0';
  }, 1800);

  // remove the background grey overlay
  document.getElementsByTagName('main')[0].className = '';
}

function saveNoteHandler() {
  for (var i = 0; i < storage.length; i++) {
    if (storage[i].id == noteBtnClicked) {
      storage[i].note = document.getElementById('description').value;
    }
  }
  setItemOnLocalStorage('tasks', JSON.stringify(storage));

  // empty the note text area and close it
  cancelNoteHandler();
}

const { useState } = React;

const products = [
  { id: 1, name: 'SSD 240GB', price: 200, image: 'https://www.kingstonstore.com.br/cdn/shop/products/A400_SA400S37_hr_22_11_2016_18_59_59fb368d-b11c-445c-9cb9-6cd3ae1e87c5_600x.jpg?v=1560977836' },
  { id: 2, name: 'SSD 480GB', price: 300, image: 'https://www.kingstonstore.com.br/cdn/shop/products/A400_SA400S37_hr_22_11_2016_18_59_59fb368d-b11c-445c-9cb9-6cd3ae1e87c5_600x.jpg?v=1560977836' },
  { id: 3, name: 'BATERIA 3.2V', price: 5, image: 'https://amoedo.vtexassets.com/arquivos/ids/187282-800-1067?v=638412735788130000&width=800&height=1067&aspect=true' }
];

const App = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [manualProductName, setManualProductName] = useState('');
  const [manualProductPrice, setManualProductPrice] = useState(0);

  const addToCart = (product) => {
    const updatedCart = [...cart, product];
    const updatedTotal = total + product.price;
    setCart(updatedCart);
    setTotal(updatedTotal);
  };

  // Função para adicionar manualmente um produto ao carrinho
  const addManualToCart = () => {
    const manualProduct = {
      id: 4,
      name: manualProductName,
      price: parseFloat(manualProductPrice),
     
    };
    const updatedCart = [...cart, manualProduct];
    const updatedTotal = total + parseFloat(manualProductPrice);
    setCart(updatedCart);
    setTotal(updatedTotal);
    setManualProductName('');
    setManualProductPrice(0);
  };

  // Função para remover um item do carrinho
  const delToCart = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    const removedItem = cart.find(item => item.id === id);
    const updatedTotal = total - removedItem.price;
    setCart(updatedCart);
    setTotal(updatedTotal);
  };

  return (
    <div className="container">
      <h1>Uso e Consumo - Itens</h1>
      <div>
        {products.map(product => (
          <div key={product.id} className="product">
            <div className="product-info">
              <img src={product.image} alt={product.name} />
              <span>{product.name}</span>
            </div>
            <button className="Adicionar" onClick={() => addToCart(product)}>Adicionar - R${product.price}</button>
          </div>
        ))}
      </div>
      <div className="manual-product">
        <h3>Uso e Consumo - Manualmente</h3>
        <input type="text" value={manualProductName} onChange={(e) => setManualProductName(e.target.value)} placeholder="Nome do Produto" />
        <input type="text" value={manualProductPrice} onChange={(e) => setManualProductPrice(e.target.value)} placeholder="Valor do Produto" />
        <button onClick={addManualToCart}>Adicionar</button>
      </div>
      <div className="cart">
        <h2>Itens Selecionados:</h2>
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <span>{item.name}</span>
            <span>R${item.price}</span>
            <button className="Remover" onClick={() => delToCart(item.id)}>Remover</button>
          </div>
        ))}
        <div className="cart-total">Total: R${total}</div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
