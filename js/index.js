var url = 'http://marketpop-garantimos-api.herokuapp.com'

if(window.location.pathname.split('/').pop() == 'index.html') {
    if(!localStorage.getItem('token')) {
        window.location = 'login.html';
    }
}

if(window.location.pathname.split('/').pop() == 'login.html' || window.location.pathname.split('/').pop() == 'register.html') {
    if(localStorage.getItem('token')) {
        window.location = 'index.html';
    }
}

// FUNCTIONS
loadUserInfos = async() => {
    await axios.get(`${url}/user`, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json'}})
    .then(response => {
        populateInfos(response.data.user);
    }).catch(error => {
        
    })
}

populateInfos = (user) => {
    let total_price = 0;

    $('#navbar_name').html(`${user.name}`);
    $('#geral_pv').html(`${user.warranties.length > 0 ? user.warranties.length : '0'}`);
    for(warranty of user.warranties) {
        total_price += warranty.product_price;
        $('#warrentieBox').append(`<div class="d-flex border-md-right flex-grow-1 align-items-left justify-content-left p-3 item">
        <i class="mdi mdi-download mr-3 icon-lg text-warning"></i>
        <div class="d-flex flex-column justify-content-around">
          <small class="mb-1 text-muted">${warranty.product_name} - ${warranty.product_price}</small>
          <h5 class="mr-2 mb-0">${moment(warranty.updatedAt).format('LLL')}</h5>
        </div>
      </div>`)
    }
    $('#geral_vtv').html(`R$${total_price == 0 ? '0,00' : total_price}`);
}

$('#loginForm').submit(e => {
    e.preventDefault();
    let data = {
        email: $('#auth_email').val(),
        password: $('#auth_pass').val()
    };
    $('#login_button').addClass('disabled');
    axios.post(`${url}/auth`, {headers: {'Content-Type': 'application/json'}}, data).then(response => {
        localStorage.setItem('token', response.data.token);
        window.location = 'index.html'
    }).catch(error => {
        alert('Confirme suas credenciais');
        $('#login_button').addClass('disabled');
    })
})

$('#registerForm').submit(e => {
    e.preventDefault();
    let data = {
        email: $('#register_email').val(),
        telephone: $('#register_telephone').val(),
        password: $('#register_pass').val(),
        company_name: $('#register_company_name').val(),
    }
    $('#register_button').addClass('disabled');
    axios.post(`${url}/auth/register`, {headers: {'Content-Type': 'application/json'}}, data).then(response => {
        localStorage.setItem('token', response.data.token);
        window.location = 'index.html'
    }).catch(error => {
        alert('Confira o e-mail e o telefone');
        $('#register_button').addClass('disabled');
    })
})

$('#warrantyForm').submit(e => {
    e.preventDefault();
    let data = {
        product_name: $('#warranty_product_name').val(),
        product_price: $('#warranty_product_price').val(),
        warranty_date: $('#warranty_warranty_date').val(),
        client_email: $('#warranty_client_email').val(),
        client_telephone: $('#warranty_client_telephone').val(),
    }
    if(data.client_email == '' && data.client_telephone == '') {
        alert('Preencha ou o email, ou o telefone do cliente, para que possamos enviar o token da garantia');
    } else {
        axios.post(`${url}/warranty/create`, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json'}}, data)
        .then(response => {
            window.location.reload();
        }).catch(error => {
            alert('Tente novamente, um erro inesperado ocorreu');
        })
    }
});

function exit() {
    localStorage.clear();
    window.location = 'login.html';
}

function checkWarrantyDays() {
    days = $('#warranty_warranty_date').val();
    if(days > 99) {
        $('#warranty_warranty_date').val(99);
    }
    if(days < 0) {
        $('#warranty_warranty_date').val(0);
    }
}
