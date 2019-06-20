window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'UA-142154778-1');

(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:1364515,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

var url = 'https://marketpop-garantimos-api.herokuapp.com' // 'http://localhost:10'

if(window.location.pathname.split('/').pop() == 'main.html') {
    if(!localStorage.getItem('token')) {
        window.location = 'index.html';
    }
}

if(window.location.pathname.split('/').pop() == 'index.html' || window.location.pathname.split('/').pop() == '' || window.location.pathname.split('/').pop() == 'register.html') {
    if(localStorage.getItem('token')) {
        window.location = 'main.html';
    }
}

var autocomplete_warranty_tags = [];
var autocomplete_warranty_prices = [];

// FUNCTIONS
loadUserInfos = async() => {
    await axios.get(`${url}/user`, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
    .then(response => {
        populateInfos(response.data.user);
    }).catch(error => {
        console.log(error);
    })
}

populateInfos = (user) => {
    let reversed_warranties = user.warranties.reverse();
    user.warranties = reversed_warranties;

    $('#edit_company_name').val(`${user.company_name}`);
    $('#edit_name').val(`${user.name}`);
    $('#edit_email').val(`${user.email}`);
    $('#edit_telephone').val(`${user.telephone}`).trigger('input');
    $('#edit_warranty_obs').val(`${user.warranties_obs}`);

    let total_price = 0;
    let in_warranty = 0;
    let warranty_price = 0;

    $('#navbar_name').html(`${user.name}`);
    $('#geral_pv').html(`${user.warranties.length > 0 ? user.warranties.length : '0'}`);
    for(warranty of user.warranties) {
        if(!autocomplete_warranty_tags.includes(warranty.product_name)) {
            autocomplete_warranty_tags.push(warranty.product_name);
            autocomplete_warranty_prices.push(warranty.product_price);
        }
        total_price += warranty.product_price;
        if(new Date(warranty.warranty_date) > new Date()) {
            $('#warrantiesBox').append(`<div class="d-flex border-md-right flex-grow-1 align-items-left justify-content-left p-3 item">
            <i class="mdi mdi-download mr-3 icon-lg text-warning"></i>
            <div class="d-flex flex-column justify-content-around">
            <small class="mb-1 text-muted">${warranty.product_name} - R$${warranty.product_price.toString().substr(0, warranty.product_price.toString().length-2)},${warranty.product_price.toString().substr(warranty.product_price.toString().length-2, warranty.product_price.toString().length)}</small>
            <h5 class="mr-2 mb-0">${moment(warranty.warranty_date).tz("America/Sao_Paulo").format('L - LT')}</h5>
            </div>
            </div>`
            )
            warranty_price += warranty.product_price;
            in_warranty ++;
        } else {
            $('#warrantiesBox').append(`<div class="d-flex border-md-right flex-grow-1 align-items-left justify-content-left p-3 item">
            <i class="mdi mdi-download mr-3 icon-lg text-danger"></i>
            <div class="d-flex flex-column justify-content-around">
            <small class="mb-1 text-muted">${warranty.product_name} - R$${warranty.product_price.toString().substr(0, warranty.product_price.toString().length-2)},${warranty.product_price.toString().substr(warranty.product_price.toString().length-2, warranty.product_price.toString().length)}</small>
            <h5 class="mr-2 mb-0">${moment(warranty.warranty_date).tz("America/Sao_Paulo").format('L - LT')}</h5>
            </div>
            </div>`
            )
        }
    }

    if(total_price == 0) total_price = "000";
    if(warranty_price == 0) warranty_price = "000";

    $('#geral_vtv').html(`R$${total_price.toString().substr(0, total_price.toString().length-2)},${total_price.toString().substr(total_price.toString().length-2, total_price.toString().length)}`);
    $('#geral_vg').html(`R$${warranty_price.toString().substr(0, warranty_price.toString().length-2)},${warranty_price.toString().substr(warranty_price.toString().length-2, warranty_price.toString().length)}`);
    $('#geral_pg').html(`${in_warranty}`);

    $('#warranty_product_name').autocomplete({
        source: autocomplete_warranty_tags,
        select: function (e, ui) {
            $('#warranty_product_price').val(autocomplete_warranty_prices[autocomplete_warranty_tags.indexOf(ui.item.value)]).trigger('input');
        },
    });
}

$('#loginForm').submit(e => {
    e.preventDefault();
    let data = {
        email: $('#auth_email').val(),
        password: $('#auth_pass').val()
    };
    $('#login_button').addClass('disabled');
    axios.post(`${url}/auth`, data).then(response => {
        localStorage.setItem('token', response.data.token);
        window.location = 'main.html'
    }).catch(error => {
        $('#login_button').removeClass('disabled');
        alert('Confirme suas credenciais');
    })
})

$('#registerForm').submit(e => {
    e.preventDefault();
    let data = {
        name: $('#register_name').val(),
        email: $('#register_email').val(),
        telephone: $('#register_telephone').cleanVal(),
        password: $('#register_pass').val(),
        company_name: $('#register_company_name').val(),
    }
    $('#register_button').addClass('disabled');
    axios.post(`${url}/auth/register`, data).then(response => {
        localStorage.setItem('token', response.data.token);
        window.location = 'main.html'
    }).catch(error => {
        alert('Confira o e-mail e o telefone');
        $('#register_button').removeClass('disabled');
    })
})

$('#warrantyForm').submit(e => {
    e.preventDefault();
    let data = {
        product_name: $('#warranty_product_name').val(),
        product_price: parseInt($('#warranty_product_price').cleanVal()),
        warranty_date: parseInt($('#warranty_warranty_date').val()),
        client_email: $('#warranty_client_email').val() != '' ? $('#warranty_client_email').val() : 'no email',
        client_telephone: $('#warranty_client_telephone').cleanVal() != '' ? parseInt($('#warranty_client_telephone').cleanVal()) : 0,
    }
    console.log(data);
    if(data.client_email == 'no email' && data.client_telephone == 0) {
        alert('Preencha ou o email, ou o telefone do cliente, para que possamos enviar o token da garantia');
    } else {
        $('#warranty_cancel_button').addClass('disabled');
        $('#warranty_add_button').addClass('disabled');
        axios.post(`${url}/warranty/create`, data, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
        .then(response => {
            alert(`O item ${response.data.warranty.product_name} foi adicionado a sua lista de garantias!`);
            // window.location.reload();
            if(response.data.whatsapp_link == null) {
                window.location.reload();
            } else {
                $('#warranty_modal_footer').html(`
                    <button type="button" onclick="window.location.reload()" class="btn btn-danger btn-icon-text">
                        <i class="mdi mdi-account-check btn-icon-prepend"></i>                                                    
                         Finalizar
                    </button>
                    <button type="button" onclick="window.location = '${response.data.whatsapp_link}'" class="btn btn-success btn-icon-text">
                        <i class="mdi mdi-whatsapp btn-icon-prepend"></i>                                                    
                         Enviar via WhatsApp
                    </button>
                `)
            }
        }).catch(error => {
            alert('Tente novamente, um erro inesperado ocorreu');
            $('#warranty_cancel_button').removeClass('disabled');
            $('#warranty_add_button').removeClass('disabled');
        })
    }
});

$('#changeForm').submit(e => {
    e.preventDefault();
    let token = $('#warranty_token').val()
    $('#warranty_check_button').addClass('disabled');
    axios.post(`${url}/warranty/${token}`, {}, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
    .then(response => {
        if(response.data.warranty._id) {
            $('#warranty_check_feedback').html(`<div style="text-align: center; font-size: 16px; font-weight: bold; color: green">Produto dentro do prazo de garantia</div>
            <br>
            <form id="exchangeForm">
              <div class="row">
                <div class="col-7" style="text-align: center;">
                  <p style="vertical-align: middle; font-size: 18px; margin-top: 12px;">Nova garantia: </p>
                </div>
                <div class="col-5">
                  <input required type="number" value="0" onkeydown="cleanInvalid()" onkeyup="checkWarrantyDays('warranty_exchange_date')" min="0" max="99" class="form-control" id="warranty_exchange_date" maxlength="2" placeholder="Dias" style="margin-bottom: 10px" required>
                </div>
              </div>
              <button id="warranty_exchange_button" onclick="exchange()" type="button" class="btn btn-block btn-success">Alterar garantia</button>
            </form>`)
        } else {
            $('#warranty_check_feedback').html(`<div style="text-align: center; font-size: 16px; font-weight: bold; color: red">Produto fora do prazo de garantia</div>
            `)
        }
        $('#warranty_check_button').removeClass('disabled');
    }).catch(error => {
        $('#warranty_check_feedback').html(`<div style="text-align: center; font-size: 16px; font-weight: bold; color: black">Token de garantia invalido</div>
            `)
        $('#warranty_check_button').removeClass('disabled');
    })
});

exchange = () => {
    let token = $('#warranty_token').val()
    let data = {
        warranty_date: $('#warranty_exchange_date').val()
    }
    $("#warranty_exchange_button").addClass('disabled');
    if(data.warranty_date == '0' || data.warranty_date == '') {
        $('#warranty_exchange_date').addClass('is-invalid')
    } else {
        axios.put(`${url}/warranty/${token}/exchange`, {warranty_date: parseInt(data.warranty_date)}, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
        .then(response => {
            alert('Troca realizada com sucesso');
            window.location.reload();
        }).catch(e => {
            $("#warranty_exchange_button").removeClass('disabled');
            console.log(e);
        });
    }
};

$('#editForm').submit(e => {
    e.preventDefault();
    let data = {
        company_name: $('#edit_company_name').val(),
        name: $('#edit_name').val(),
        email: $('#edit_email').val(),
        telephone: $('#edit_telephone').cleanVal(),
        warranties_obs: $('#edit_warranty_obs').val()
    }
    axios.put(`${url}/user/update`, data, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
    .then(response => {
        alert('Informações atualizadas com sucesso');
        window.location.reload();
    }).catch(error => {
        console.log(error);
    })
});

function exit() {
    localStorage.clear();
    window.location = 'index.html';
}

function checkWarrantyDays(id) {
    days = $(`#${id}`).val();
    if(days > 99) {
        $(`#${id}`).val(99);
    }
    if(days < 0) {
        $(`#${id}`).val(0);
    }
}

function cleanCheckFeedback() {
    $('#warranty_check_feedback').html('');
}

function cleanInvalid() {
    $("#warranty_exchange_date").removeClass('is-invalid');
}
