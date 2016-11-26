$(function () {

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
                var potvrdi = confirm("Zelite izbrisati korisnika koristeci url:\n " + url + "\nJeste li sigurni?");
                if(potvrdi==true) {
                    alert("Brisem korisnika");
                } else {
                    alert("Odustajem");
                }
            },
            urediKorisnika: function (id) {
                var url = "https://justin-time.herokuapp.com/user/update/";
                url += id;
                //alert("Zelite urediti korisnika koristeci url:\n " + url);
                //dodati i sva polja odvojena upitnicima za svaki podatak i odvojiti & znakovima

                korisnik.pronadjiKorisnika(id);
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
            password: ""
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
                if(this.id) {
                    this.update();
                } else {
                    this.dodaj();
                }
            },
            update: function () {
                alert("Postojeći korisnik - mijenjam");
                //todo:paziti da ne bude duplikat po mailu u bazi prije dodavanja i mijenjanja
            },
            dodaj: function () {
                alert("Novi korisnik - dodajem!");
            }
        }
    });


});