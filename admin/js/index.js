$(jQuery).ready(() => {
    axios.get("https://marketpop-garantimos-api.herokuapp.com/users")
    .then(async response => {
        let users = [];
        let warranties = [];
        let total = 0;
        
        for(user of response.data) {
            await users.push(user);
            user.total = 0;
            for(warranty of user.warranties) {
                user.total += warranty.product_price
                total += warranty.product_price;
                await warranties.push(warranty);
            }
        }

        users.sort(function(a, b) {
            var keyA = new Date(a.total),
                keyB = new Date(b.total);
            // Compare the 2 dates
            if(keyA < keyB) return 1;
            if(keyA > keyB) return -1;
            return 0;
        })

        let months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        let index = 1;
        let userValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let warrantyValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let priceValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        for(user of users) {
            userValues[moment(user.createdAt).format('M')-1]++;
            $('#ranking_box').append(`
            <tr>
                <td><b>${index}.</b> ${user.name}, <i>${user.company_name}</i></td>
                <td>R$${user.total.toString().substr(0, user.total.toString().length-2)},${user.total.toString().substr(user.total.toString().length-2, user.total.toString().length)}</td>
            </tr>
            `)
            index++;
        }

        for(warranty of warranties) {
            warrantyValues[moment(warranty.createdAt).format('M')-1]++;
            priceValues[moment(warranty.createdAt).format('M')-1]+=warranty.product_price
            $('#warranty_box').append(`
                <tr>
                    <td>${moment(warranty.createdAt).format('L - LT')}</td>
                    <td>${warranty.token}</td>
                    <td>${warranty.product_name}</td>
                    <td class="text-right">R$${warranty.product_price.toString().substr(0, warranty.product_price.toString().length-2)},${warranty.product_price.toString().substr(warranty.product_price.toString().length-2, warranty.product_price.toString().length)}</td>
                    <td class="text-right">${warranty.client_email}</td>
                    <td class="text-right">${warranty.client_telephone}</td>
                </tr>
            `)
        }

        $("#usuarios_cadastrados").html(`${users.length}`);
        var ctx = document.getElementById("widgetChart1");
        if (ctx) {
            ctx.height = 130;   
            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                labels: months,
                type: 'line',
                datasets: [{
                    data: userValues,
                    label: 'Usuarios',
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderColor: 'rgba(255,255,255,.55)',
                },]
                },
                options: {
                maintainAspectRatio: true,
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                    gridLines: {
                        color: 'transparent',
                        zeroLineColor: 'transparent'
                    },
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent'
                    }
                    }],
                    yAxes: [{
                    display: false,
                    ticks: {
                        display: false,
                    }
                    }]
                },
                title: {
                    display: false,
                },
                elements: {
                    line: {
                    borderWidth: 0
                    },
                    point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4
                    }
                }
                }
            });
        }

        $("#garantias_geradas").html(`${warranties.length}`);
        var ctx = document.getElementById("widgetChart2");
        if (ctx) {
            ctx.height = 130;
            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                labels: months,
                type: 'line',
                datasets: [{
                    data: warrantyValues,
                    label: 'Garantias',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                },]
                },
                options: {

                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                responsive: true,
                tooltips: {
                    mode: 'index',
                    titleFontSize: 12,
                    titleFontColor: '#000',
                    bodyFontColor: '#000',
                    backgroundColor: '#fff',
                    titleFontFamily: 'Montserrat',
                    bodyFontFamily: 'Montserrat',
                    cornerRadius: 3,
                    intersect: false,
                },
                scales: {
                    xAxes: [{
                    gridLines: {
                        color: 'transparent',
                        zeroLineColor: 'transparent'
                    },
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent'
                    }
                    }],
                    yAxes: [{
                    display: false,
                    ticks: {
                        display: false,
                    }
                    }]
                },
                title: {
                    display: false,
                },
                elements: {
                    line: {
                    tension: 0.00001,
                    borderWidth: 1
                    },
                    point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4
                    }
                }
                }
            });
        }

        $("#total_administrado").html(`R$${total.toString().substr(0, total.toString().length-2)},${total.toString().substr(total.toString().length-2, total.toString().length)}`)
        var ctx = document.getElementById("widgetChart4");
        if (ctx) {
            ctx.height = 115;
            var myChart = new Chart(ctx, {
                type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: "Centavos",
              data: priceValues,
              borderColor: "transparent",
              borderWidth: "0",
              backgroundColor: "rgba(255,255,255,.3)"
            }
          ]
        },
        options: {
          maintainAspectRatio: true,
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: false,
              categoryPercentage: 1,
              barPercentage: 0.65
            }],
            yAxes: [{
              display: false
            }]
          }
        }
            });
        }

    }).catch(e => {
        console.log(e);
    })
})
