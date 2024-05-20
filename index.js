import express from "express";
import bodyParser from "body-parser";
import city from "list-of-moroccan-cities"



const app = express();
const port = 3000;
const citiesOfMorocco = city

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

const clientsList=[
  {fname : "Abderrahim",lname :"Oujdi", phone :"0651565748", 
    city :"Agadir",adress :"Hay Essaada rue 1613 N°1, Dcheira",platforme :"Tiktok"},
  {fname : "Fayza",lname :"Bouderqua", phone :"0762830326", 
    city :"Taroudant",adress :"Sidi Belkass rue 2 N°15",platforme :"Facebook Ads"},
  {fname : "Arwa",lname :"Oujdi", phone :"0651565748", 
    city :"Agadir",adress :"Hay Essaada rue 1613 N°1, Dcheira",platforme :"Tiktok"},
  {fname : "Saad",lname :"Tsouli", phone :"0651565748", 
    city :"Tanger",adress :"Sidi Belkass rue 2 N°15",platforme :"Instagram"}
  ]

const commandesList=[
  { client : "Abderrahim Oujdi",montant :"500", avance :"150",livraison :"40", rest :"390" ,nbrArticls :"3",trakingNbr :"QB185486711MA",
  discription :"deux pantalons et une chausseure",date : "2024-05-06"
  },
  { client : "Driss Oujdi",montant :"1000", avance :"320",livraison :"0", rest :"680",nbrArticls :"5",trakingNbr :"QB185486711MA",
  discription :"une chemise et un pantalon",date : "2024-05-10"
}
] 

const ficheCompta=[]


// Get Routes
app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/clients", (req, res) => {
  res.render("clients.ejs");
});

app.get("/ajouterClients", (req, res) => {
  res.render("ajouter-client.ejs",{city : citiesOfMorocco});
});
app.get("/listeClients", (req, res) => {
  res.render("liste-clients.ejs",{clients : clientsList});
});
app.get("/ajouterCommande", (req, res) => {
  res.render("ajouter-commande.ejs",{clients : clientsList});
});
app.get("/listeCommandes", (req, res) => {
  res.render("liste-commandes.ejs",{commandes : commandesList});
});
app.get("/reglerCompta", (req, res) => {
  res.render("comptabilite.ejs");
});
app.get("/fiche-compta", (req, res) => {
  res.render("fiche-compta.ejs");
});





//Post Routes
app.post("/ajouterClients", (req, res) => {
  let client = {
    fname : req.body["fName"],
    lname :req.body["lName"], 
    phone :req.body["phone"], 
    city :req.body["city"],
    adress :req.body["adress"],
    platforme :req.body["platforme"] 
  }
  clientsList.push(client)
  res.redirect("/ajouterClients");
});

app.post("/ajouterCommande", (req, res) => {
  let commande = {
    client : req.body["client"],
    montant :req.body["montant"], 
    avance :req.body["avance"],
    livraison :req.body["Frais de livraison"], 
    rest :parseInt(req.body["montant"], 10)-parseInt(req.body["avance"],10)+parseInt(req.body["Frais de livraison"],10),
    nbrArticls :req.body["numberArticls"],
    trakingNbr :req.body["tracking number"],
    date : getCurrentDate(),
    discription :req.body["discription"]
  }
  commandesList.push(commande)
  res.redirect("/ajouterCommande")
});

app.post("/reglerCompta", (req, res) => {
  let compta = {
    baridBank : req.body["Barid Bank"],
    cihBank :req.body["CIH Bank"], 
    chaabiBank :req.body["Chaabi Bank"],
    cash :req.body["Cash"], 
    cashBeyou :req.body["Cash BEYOU"],
    fournisseur :req.body["Fournisseur"],
    commandeImpaye :req.body["Commandes impayées"],
    commandeEnLivraison :req.body["Commandes en cours de livraison"],
    capitalReel :parseInt(req.body["Barid Bank"], 10)+parseInt(req.body["CIH Bank"], 10)+parseInt(req.body["Chaabi Bank"], 10)+parseInt(req.body["Cash"], 10)+parseInt(req.body["Cash BEYOU"], 10)+parseInt(req.body["Fournisseur"], 10),
    capitalGeneral:parseInt(req.body["Barid Bank"], 10)+parseInt(req.body["CIH Bank"], 10)+parseInt(req.body["Chaabi Bank"], 10)+parseInt(req.body["Cash"], 10)+parseInt(req.body["Cash BEYOU"], 10)+parseInt(req.body["Fournisseur"], 10)+parseInt(req.body["Commandes impayées"], 10)+parseInt(req.body["Commandes en cours de livraison"], 10),
    date : getCurrentDate(),
  }
  ficheCompta.push(compta)
  console.log(ficheCompta)
  res.render("fiche-compta.ejs",{fichCompta : compta})
});

app.post("/listeClients", (req, res) => {
  let search = req.body["search"].toUpperCase()
  let clientFound = false
  let searchedClient = [];
  clientsList.forEach(client =>{
    if(client.fname.toUpperCase().indexOf(search)>-1 || client.lname.toUpperCase().indexOf(search)>-1){
      searchedClient.push(client)
      clientFound = true
    }
  })
  if(clientFound){
    console.log(searchedClient)
  }else{
    console.log("client not found")
  }
  res.render("liste-clients.ejs",{clients : searchedClient}); 
  
  })

  app.post("/listeCommandes", (req, res) => {
    let search = req.body["search"].toUpperCase()
    let commandFound = false
    let searchedCommande = [];
    commandesList.forEach(commande =>{
      if(commande.client.toUpperCase().indexOf(search)>-1){
        searchedCommande.push(commande)
        commandFound = true
      }
    })
    if(commandFound){
      console.log(searchedCommande)
    }else{
      console.log("commande not found")
    }
    res.render("liste-commandes.ejs",{commandes : searchedCommande});    
    })

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});



function getCurrentDate() {
  let date = new Date();
  
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, '0'); 
  let day = date.getDate().toString().padStart(2, '0'); 

  return `${year}-${month}-${day}`;
}



