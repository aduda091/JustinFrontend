$(function () {
    $('[data-target="#dodajKorisnikaModal"]').click(function () {
        korisnik.resetirajPolja();
    });

    $('.sidebar').hide();
    //preloader
    var preloader = '<div class="loader loader-default"></div>';
    $('body').append(preloader);
    $(document).ajaxStart(function () {
        $(".loader").addClass("is-active");
    });
    $(document).ajaxComplete(function () {
        $(".loader").removeClass("is-active");
    });


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
                    url: url
                }).done(function( data ) {
                    app.korisnici = data;
                }).fail(function(jqxhr, textStatus, error) {
                    console.log( textStatus + " " + error);
                });
            },
            obrisiKorisnika: function (id) {
                var url = "https://justin-time.herokuapp.com/user/delete/";
                url += id;
                var potvrdi = confirm("Potvrdi brisanje korisnika?");
                if(potvrdi==true) {
                    $.ajax({
                        method: "GET",
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
            urediKorisnika: function (id) {
                korisnik.pronadjiKorisnika(id);
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
            pronadjiKorisnika: function (id) {
                var url = "https://justin-time.herokuapp.com/user/id/";
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
                uvjet = uvjet && this.password != "";
                if(!uvjet) {
                    alert("Nisu (ispravno) popunjena sva polja!");
                    return;
                }
                var url = "https://justin-time.herokuapp.com/user/update/";
                url += this.id;
                url += "?firstName=" + this.firstName;
                url += "&lastName=" + this.lastName;
                url += "&mail=" + this.mail;
                url += "&password=" + this.password;
                var app = this;
                $.ajax({
                    method: "GET",
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
                    method: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    cache: true,
                    url: url
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


});