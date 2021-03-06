$(function () {


    var token = localStorage.getItem("token");

    $('.sidebar').hide();




    var korisnici = new Vue({
        el: '#popisKorisnika',
        data: {
            korisnici: [

            ],
            searchString: ""
        },
        computed: {
            dohvaceniKorisnici: function () {
                var korisnici_array = this.korisnici,
                    searchString = this.searchString;

                if(!searchString){
                    return korisnici_array;
                }
                searchString = searchString.trim().toLowerCase();
                korisnici_array = korisnici_array.filter(function(item){
                    var uvjet = item.firstName.toLowerCase().indexOf(searchString) !== -1;
                    uvjet = uvjet || item.lastName.toLowerCase().indexOf(searchString) !== -1;
                    uvjet = uvjet || item.mail.toLowerCase().indexOf(searchString) !== -1;
                    if(uvjet){
                        return item;
                    }
                });
                return korisnici_array;
            }
        },
        methods: {
            popuniKorisnike: function() {
                var url = "https://justin-time.herokuapp.com/user/read-all";
                var app = this;
                $.ajax({
                    method: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url,
                    data: {
                        "access_token": token
                    }
                }).done(function( data ) {
                    app.korisnici = data;
                }).fail(function(jqxhr, textStatus, error) {
                    console.log( textStatus + " " + error);
                });
            },
            obrisiKorisnika: function (id) {
                var url = "https://justin-time.herokuapp.com/user/delete/";
                url += id;
                url += "?access_token=" +token;
                var potvrdi = confirm("Potvrdi brisanje korisnika?");
                if(potvrdi==true) {
                    $.ajax({
                        method: "DELETE",
                        contentType: 'application/json',
                        dataType: "json",
                        cache: true,
                        url: url
                    }).done(function( data ) {
                        alert("Korisnik obrisan!");
                        korisnici.popuniKorisnike();
                    }).fail(function(jqxhr, textStatus, error) {
                        console.log( textStatus + " " + error);
                        alert("Greška prilikom brisanja: \n" +error);
                        console.log("Url: " + url);
                    });
                }
            },
            urediKorisnika: function (mail) {
                korisnik.pronadjiKorisnika(mail);
                korisnik.opcija = "Uredi";
                $('#dodajKorisnikaModal').modal('show');
            }
        },

        created: function () {
            this.popuniKorisnike();
        }
    });


    var korisnik = new Vue({
        el: '#dodajKorisnikaModal',
        data: {
            id: "",
            firstName: "",
            lastName: "",
            mail: "",
            password: "",
            opcija: "Dodaj"
        },
        methods: {
            pronadjiKorisnika: function (mail) {
                var url = "https://justin-time.herokuapp.com/user/";
                url += mail;

                var app = this;
                $.ajax({
                    method: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url,
                    data: {
                        "access_token" : token
                    }
                }).done(function( data ) {
                    app.id = data.id;
                    app.firstName = data.firstName;
                    app.lastName = data.lastName;
                    app.mail = data.mail;
                    app.password = data.password;
                }).fail(function(jqxhr, textStatus, error) {
                    console.log( textStatus + " " + error);
                });
            },
            spremi: function () {
                //ako objekt ima id znači da su pročitani podaci postojećeg korisnika
                if(this.id) {
                    this.update();
                } else {
                    this.dodaj();
                }
            },
            update: function () {
                var uvjet = this.firstName != "";
                uvjet = uvjet && this.lastName != "";
                uvjet = uvjet && this.mail != "";
                uvjet = uvjet && this.provjeriMail();
                //uvjet = uvjet && this.password != "";
                if(!uvjet) {
                    alert("Nisu (ispravno) popunjena sva polja!");
                    return;
                }
                var url = "https://justin-time.herokuapp.com/user/update/";
                url += this.id;
                url += "?firstName=" + this.firstName;
                url += "&lastName=" + this.lastName;
                url += "&mail=" + this.mail;
                //url += "&password=" + this.password;
                url += "&access_token=" + token;
                var app = this;
                $.ajax({
                    method: "PUT",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url
                }).done(function( data ) {
                    alert("Podaci spremljeni");
                    app.id = data.id;
                    app.firstName = data.firstName;
                    app.lastName = data.lastName;
                    app.mail = data.mail;
                    app.password = data.password;
                    korisnici.popuniKorisnike();
                }).fail(function(jqxhr, textStatus, error) {
                    console.log( textStatus + " " + error);
                    alert("Greška prilikom spremanja: \n" +error);
                });
            },
            dodaj: function () {
                var uvjet = this.firstName != "";
                uvjet = uvjet && this.lastName != "";
                uvjet = uvjet && this.mail != "";
                uvjet = uvjet && this.provjeriMail();
                uvjet = uvjet && this.password != "";
                if(!uvjet) {
                    alert("Nisu (ispravno) popunjena sva polja!");
                    return;
                }
                var url = "https://justin-time.herokuapp.com/user/create";
                url += "?firstName=" + this.firstName;
                url += "&lastName=" + this.lastName;
                url += "&mail=" + this.mail;
                url += "&password=" + this.password;
                var app = this;
                $.ajax({
                    method: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url,
                    statusCode: {
                        409: function () {
                            alert("Već postoji korisnik s tim emailom!");
                        }
                    }
                }).done(function( data ) {
                    alert("Podaci spremljeni");
                    //app.id = data.id;
                    //app.pronadjiKorisnika(data.id);
                    app.resetirajPolja();
                    korisnici.popuniKorisnike();
                }).fail(function(jqxhr, textStatus, error) {
                    console.log( textStatus + " " + error);
                    alert("Greška prilikom spremanja: \n" +error);
                });
            },
            resetirajPolja: function () {
                this.id = "";
                this.firstName = "";
                this.lastName = "";
                this.mail = "";
                this.password = "";
                this.opcija = "Dodaj";
            },
            provjeriMail: function () {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(this.mail);//ispituje ispravnost email adrese tako da se donji kod izvrši tek nakon provjere
            }
        },
        watch: {
            mail: function () {
                var test = this.provjeriMail();
                var postojeci = false;
                if(test) {
                    for(var i=0; i< korisnici.korisnici.length;i++) {
                        if(korisnici.korisnici[i].id != this.id) {
                            if(korisnici.korisnici[i].mail == this.mail) {
                                postojeci = true;
                            }
                        }
                    }
                }
                if(postojeci) {
                    $("#email_error").remove();
                    $("#mailInput").parent().addClass('has-error')
                        .append('<span id="email_error" class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>')
                        .attr("title", "Email adresa već pripada postojećem korisniku");
                    $("#spremiKorisnikaBtn").attr("disabled", true).attr("title", "");
                }
                else {
                    $("#mailInput").parent().removeClass('has-error');
                    $("#email_error").remove();
                    $("#spremiKorisnikaBtn").attr("disabled", false);
                }


            }
        }
    });

    /* Kraj korisnika  */

    var ustanove = new Vue({
        el: '#popisUstanova',
        data: {
            ustanove: [

            ],
            searchString: ""
        },
        computed: {
            dohvaceneUstanove: function () {
                var ustanove_array = this.ustanove,
                    searchString = this.searchString;

                if(!searchString){
                    return ustanove_array;
                }
                searchString = searchString.trim().toLowerCase();
                ustanove_array = ustanove_array.filter(function(item){
                    var uvjet = item.name.toLowerCase().indexOf(searchString) !== -1;
                    uvjet = uvjet || item.address.toLowerCase().indexOf(searchString) !== -1;
                    uvjet = uvjet || item.mail.toLowerCase().indexOf(searchString) !== -1;
                    uvjet = uvjet || item.telephone.toLowerCase().indexOf(searchString) !== -1;
                    if(uvjet){
                        return item;
                    }
                });
                return ustanove_array;
            }
        },
        methods: {
            popuniUstanove: function() {
                var url = "https://justin-time.herokuapp.com/facility/read-all";
                var app = this;
                $.ajax({
                    method: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url,
                    data: {
                        "access_token": token
                    }
                }).done(function( data ) {
                    app.ustanove = data;
                }).fail(function(jqxhr, textStatus, error) {
                    console.log( textStatus + " " + error);
                });
            },
            obrisiUstanovu: function (id) {
                var url = "https://justin-time.herokuapp.com/facility/delete/";
                url += id;
                url += "?access_token=" +token;

                var potvrdi = confirm("Potvrdi brisanje ustanove?");
                if(potvrdi==true) {
                    $.ajax({
                        method: "DELETE",
                        contentType: 'application/json',
                        dataType: "json",
                        cache: true,
                        url: url
                    }).done(function( data ) {
                        alert("Ustanova obrisana!");
                        ustanove.popuniUstanove();
                        redovi.popuniUstanove();
                    }).fail(function(jqxhr, textStatus, error) {
                        console.log( textStatus + " " + error);
                        alert("Greška prilikom brisanja: \n" +error);
                        console.log("Url: " + url);
                    });
                }
            },
            urediUstanovu: function (id) {
                ustanova.pronadjiUstanovu(id);
                ustanova.opcija = "Uredi";
                $('#dodajUstanovuModal').modal('show');
            }
        },

        created: function () {
            this.popuniUstanove();
        }
    });


    var ustanova = new Vue({
        el: '#dodajUstanovuModal',
        data: {
            id: "",
            name: "",
            address: "",
            mail: "",
            telephone: "",
            opcija: "Dodaj"
        },
        methods: {
            pronadjiUstanovu: function (id) {
                var url = "https://justin-time.herokuapp.com/facility/";
                url += id;
                var app = this;
                $.ajax({
                    method: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url
                }).done(function( data ) {
                    app.id = data.id;
                    app.name = data.name;
                    app.address = data.address;
                    app.mail = data.mail;
                    app.telephone = data.telephone;
                }).fail(function(jqxhr, textStatus, error) {
                    console.log( textStatus + " " + error);
                });
            },
            spremi: function () {
                //ako objekt ima id znači da su pročitani podaci postojeće ustanove
                if(this.id) {
                    this.update();
                } else {
                    this.dodaj();
                }
            },
            update: function () {
                var uvjet = this.name != "";
                //uvjet = uvjet && this.lastName != "";
                //uvjet = uvjet && this.mail != "";
                //uvjet = uvjet && this.provjeriMail();
                //uvjet = uvjet && this.password != "";
                if(!uvjet) {
                    alert("Nisu (ispravno) popunjena sva polja!");
                    return;
                }
                var url = "https://justin-time.herokuapp.com/facility/update/";
                url += this.id;
                url += "?name=" + this.name;
                url += "&address=" + this.address;
                url += "&mail=" + this.mail;
                url += "&telephone=" + this.telephone;
                url += "&access_token=" + token;
                var app = this;
                $.ajax({
                    method: "PUT",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url
                }).done(function( data ) {
                    alert("Podaci spremljeni");
                    app.id = data.id;
                    app.name = data.name;
                    app.address = data.address;
                    app.mail = data.mail;
                    app.telephone = data.telephone;
                    ustanove.popuniUstanove();
                }).fail(function(jqxhr, textStatus, error) {
                    console.log( textStatus + " " + error);
                    alert("Greška prilikom spremanja: \n" +error);
                });
            },
            dodaj: function () {
                var uvjet = this.name != "";
                // uvjet = uvjet && this.lastName != "";
                // uvjet = uvjet && this.mail != "";
                // uvjet = uvjet && this.provjeriMail();
                // uvjet = uvjet && this.password != "";
                if(!uvjet) {
                    alert("Nisu (ispravno) popunjena sva polja!");
                    return;
                }
                var url = "https://justin-time.herokuapp.com/facility/create";
                url += "?name=" + this.name;
                url += "&address=" + this.address;
                url += "&mail=" + this.mail;
                url += "&telephone=" + this.telephone;
                url += "&access_token=" + token;
                var app = this;
                $.ajax({
                    method: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url
                }).done(function( data ) {
                    alert("Podaci spremljeni");
                    //app.id = data.id;
                    //app.pronadjiKorisnika(data.id);
                    app.resetirajPolja();
                    ustanove.popuniUstanove();
                }).fail(function(jqxhr, textStatus, error) {
                    console.log( textStatus + " " + error);
                    alert("Greška prilikom spremanja: \n" +error);
                });
            },
            resetirajPolja: function () {
                this.id = "";
                this.name = "";
                this.address = "";
                this.mail = "";
                this.telephone = "";
                this.opcija = "Dodaj";
            },
            provjeriMail: function () {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(this.mail);//ispituje ispravnost email adrese tako da se donji kod izvrši tek nakon provjere
            }
        },
        watch: {
            /*mail: function () {
                var test = this.provjeriMail();
                var postojeci = false;
                if(test) {
                    for(var i=0; i< korisnici.korisnici.length;i++) {
                        if(korisnici.korisnici[i].id != this.id) {
                            if(korisnici.korisnici[i].mail == this.mail) {
                                postojeci = true;
                            }
                        }
                    }
                }
                if(postojeci) {
                    $("#email_error").remove();
                    $("#mailInput").parent().addClass('has-error')
                        .append('<span id="email_error" class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>')
                        .attr("title", "Email adresa već pripada postojećem korisniku");
                    $("#spremiKorisnikaBtn").attr("disabled", true).attr("title", "");
                }
                else {
                    $("#mailInput").parent().removeClass('has-error');
                    $("#email_error").remove();
                    $("#spremiKorisnikaBtn").attr("disabled", false);
                }


            }*/
        }
    });
/*   kraj ustanova   */

    var redovi = new Vue({
        el: '#popisRedova',
        data: {
            ustanove: [],
            noviRed: "",
            noviRedUstanovaId: ""

        },
        methods: {
            popuniUstanove: function () {
                var url = "https://justin-time.herokuapp.com/facility/read-all";
                var app = this;
                $.ajax({
                    method: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url,
                    data: {
                        "access_token": token
                    }
                }).done(function (data) {
                    app.ustanove = data;
                }).fail(function (jqxhr, textStatus, error) {
                    console.log(textStatus + " " + error);
                });
            },
            urediRed: function (ustanova_id, red_id, ustanova_naziv, red_naziv) {
                var novoIme = prompt("Unesi novo ime za red " + red_naziv + " koji pripada ustanovi " + ustanova_naziv, red_naziv);
                if(novoIme != null && novoIme != "") {
                    var url = "https://justin-time.herokuapp.com/queue/update/";
                    url += ustanova_id;
                    url += "/";
                    url += red_id;
                    url += "?name=" + novoIme;
                    url += "&access_token=" + token;

                    $.ajax({
                        method: "PUT",
                        contentType: 'application/json',
                        dataType: "json",
                        cache: true,
                        url: url
                    }).done(function( data ) {
                        alert("Red uspješno preimenovan!");
                        redovi.popuniUstanove();
                    }).fail(function(jqxhr, textStatus, error) {
                        console.log( textStatus + " " + error);
                        alert("Greška prilikom uređivanja: \n" +error);
                        console.log("Url: " + url);
                    });
                }
            },
            obrisiRed: function (ustanova_id, red_id) {
                var url = "https://justin-time.herokuapp.com/queue/delete/";
                url += ustanova_id;
                url += "/";
                url += red_id;
                url += "?access_token=" +token;
                var potvrdi = confirm("Potvrdi brisanje reda?");
                if(potvrdi==true) {
                    $.ajax({
                        method: "DELETE",
                        contentType: 'application/json',
                        dataType: "json",
                        cache: true,
                        url: url
                    }).done(function( data ) {
                        alert("Red obrisan!");
                        redovi.popuniUstanove();
                    }).fail(function(jqxhr, textStatus, error) {
                        console.log( textStatus + " " + error);
                        alert("Greška prilikom brisanja: \n" +error);
                        console.log("Url: " + url);
                    });
                }
            },
            dodajRed: function () {
                var url = "https://justin-time.herokuapp.com/queue/create/";
                url += this.noviRedUstanovaId;
                url += "?name=" + this.noviRed;
                url += "&access_token=" + token;
                var app = this;
                if(this.noviRedUstanovaId != "" && this.noviRed != "") {
                    $.ajax({
                        method: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        cache: true,
                        url: url
                    }).done(function( data ) {
                        alert("Red dodan!");
                        app.noviRed = "";
                        app.noviRedUstanovaId = "";
                        redovi.popuniUstanove();
                    }).fail(function(jqxhr, textStatus, error) {
                        console.log( textStatus + " " + error);
                        alert("Greška prilikom dodavanja: \n" +error);
                        console.log("Url: " + url);
                    });
                } else {
                    alert("Neispravno popunjena polja");
                }


            }
        },
        created: function () {
            this.popuniUstanove();
        }
    });



//resetiranje input polja koja se popune u trenutku editiranja nečega
    $('[data-target="#dodajKorisnikaModal"]').click(function () {
        korisnik.resetirajPolja();
    });
    $('[data-target="#dodajUstanovuModal"]').click(function () {
        ustanova.resetirajPolja();
    });

    $('[href="#noviRedHeader"]').click(function () {
        $("#noviRedInput").focus();
    });

});