<template>
  <button @click="loadAddGuest">Añadir Cliente</button> 

  <h2 class= "noRooms" v-if="!guestList.length && loaded">Sin clientes registrados</h2>
  <h2 class="loadingMsg" v-if="!loaded">Cargando...</h2>
  <div class="tableRooms-container">
  <table class="tableRooms" v-if="guestList.length && loaded">
    <tr>
      <th>Documento de identidad</th>
      <th>Tipo de documento</th>
      <th>Nombre</th>
      <th>Telefono</th>
      <th>Opciones</th>
    </tr>
    <tr v-for="(cliente,index) in guestList" v-bind:key="cliente.doc_id">
      <td>{{ cliente.doc_id }}</td>
      <td>{{ cliente.type_doc }}</td>
      <td>{{ cliente.first_name }} {{ cliente.last_name }}</td>
      <td>{{ cliente.phone }}</td>
      <td>
        <button v-on:click="showDetailGuest(index)">Detalle</button>
        <button v-on:click="loadEditGuest(index)">Editar</button>
        <button v-on:click="processDelete(cliente.doc_id)">Eliminar</button>
      </td>
    </tr>
  </table>
  </div>
  <ModalGuest v-show="isDetailGuestVisible" @close="closeDetailGuest">
    <template v-slot:header>
      <h1>Información cliente</h1>
    </template>
    <template v-slot:body>
      <p>Nombre completo: {{ detailGuest.first_name  }} {{detailGuest.last_name}}</p>
      <p>Documento: {{detailGuest.doc_id}} {{detailGuest.type_doc}}</p>
      <p>Fecha de nacimiento: {{ format_BD }}</p>
      <p>Telefono: {{ detailGuest.phone }}</p>
      <p>Correo: {{ detailGuest.email }}</p>
    </template>
    <template v-slot:footer>Reservas Hechas...</template>
  </ModalGuest>
  <!-- <EditRoom v-show="isEditRoomVisible">
    <template v-slot:form>
      <form v-on:submit.prevent="processUpdateRoom">
        <input type="number" v-model="updateRoom.room_number" placeholder="Ej. 101" />
        <br />
        <select v-model="updateRoom.room_type">
          <option disabled value="">Seleccione un elemento</option>
          <option>IND</option>
          <option>FAM</option>
          <option>DOB</option>
          <option>OTR</option>
        </select>
        <br />
        <input type="text" v-model="updateRoom.room_description" placeholder="Ej. TV" />
        <br />
        <input type="number" v-model="updateRoom.capacity" placeholder="Ej. 1" />
        <br />
        <input type="number" v-model="updateRoom.price" placeholder="Ej. 20000" />
        <br />
        <select v-model="updateRoom.status_room">
          <option disabled value="">Seleccione un elemento</option>
          <option>DIS</option>
          <option>OCU</option>
          <option>MAN</option>
          <option>DES</option>
        </select>
        <br />
        <button type="submit">Actualizar</button>
        <button type ="button" @click="closeEditRoom">Cancelar</button>
      </form>
      
    </template>
  </EditRoom> -->
  <ModalGuest v-show="isAddGuestVisible" @close="closeAddGuest">
    <template v-slot:header>
      <h1>Crear cliente</h1>
    </template>
    <template v-slot:body>
      <form v-on:submit.prevent="processAddGuest" class="form-add-guest">
        <label for="fname">Nombres: </label>
        <input type="text" v-model="updateGuest.first_name" id="fname"/>
        <label for="lname">Apellidos: </label>
        <input type="text" v-model="updateGuest.last_name" id="lname"/>
        <br>
        <label for="doc_id">Documento de identidad: </label>
        <input type="text" v-model="updateGuest.doc_id" id="doc_id"/>
        <label for="doc_ty">Tipo de documento: </label>
        <select v-model="updateGuest.type_doc" id ="doc_ty">
          <option>CC</option>
          <option>CE</option>
          <option>TI</option>
          <option>PA</option>
        </select>
        <br>
        <label for="bday">Fecha de nacimiento: </label>
        <input type="date" v-model="updateGuest.birthdate" id="bday"/>
        <label for="Iphone">Telefono: </label>
        <input type="number" v-model="updateGuest.phone" id ="Iphone"/>
        <br>
        <label for="Iemail">Correo: </label>
        <input type="email" v-model="updateGuest.email" id="Iemail"/>
        <br>
        <button type="submit">Añadir</button>
      </form>
    </template>
    <template v-slot:footer></template>
  </ModalGuest>
</template>


<script>
import axios from "axios";
import ModalGuest from "./ModalGuest.vue";


export default {
  name: "GuestList",
  components: {
    ModalGuest,
  },

  data: function () {
    return {
      format_BD:"",
      updateGuest: {},
      guestList: [],
      guest: {
        doc_id : "",
        type_doc : "",
        first_name : "", 
        last_name : "",
        birthdate : "",
        phone : "",
        email : "",
      },
      detailGuest: {},
      isAddGuestVisible:false,
      isDetailGuestVisible: false,
      isEditGuestVisible: false,
      idUpdate:0,
      loaded: false
    };
  },

  methods: {
    getData: async function () {
      if (
        localStorage.getItem("token_access") === null ||
        localStorage.getItem("token_refresh") === null
      ) {
        this.$emit("logOut");
        return;
      }
      await this.verifyToken();

      let token = localStorage.getItem("token_access");
      axios
        .get(`http://127.0.0.1:8000/guest/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((result) => {
          result.data.forEach((element) => {
            this.guestList.push(element);
          });
          this.loaded = true;
        })
        .catch((exce) => {
          console.log(exce);
          //this.$emit("logOut");
        });
    },
    // processUpdateRoom: async function(){
    //   await this.verifyToken();
    //   axios
    //     .put(`http://127.0.0.1:8000/room/${this.idUpdate}/update`, this.updateRoom, {
    //          headers: {Authorization: `Bearer ${localStorage.getItem("token_access")}`} 
    //         })
    //     .then((result) => {      
    //       alert("Habitación actualizada con exito")
    //       this.updateRoom.length = 0;
    //       this.rooms.length = 0;
    //       this.getData();
    //       this.closeEditRoom();
    //     })
    //     .catch((error) => {
    //       console.log(error.response.data);
    //       if(error.response.data.room_number) alert('ERROR: Ya existe una habitación con ese numero')
    //       else alert("ERROR: Fallo en la actualización.\n" + error);
    //     });
      
    // },
    processAddGuest: async function() {
        await this.verifyToken();
        axios.post('http://127.0.0.1:8000/guest/create/', this.updateGuest,{
          headers: {Authorization: `Bearer ${localStorage.getItem("token_access")}`} 
        }).then((result) => {
          alert("Cliente creado con exito")
          this.guestList.length=0;
          this.getData();
          this.closeAddGuest();
        }).catch((error) =>{
            console.log(error.response.data);
            alert("ERROR: Fallo en la creacion del cliente.\n" + error);
        })
    },
    verifyToken: function () {
      return axios
        .post(
          "http://127.0.0.1:8000/refresh/",
          { refresh: localStorage.getItem("token_refresh") },
          { headers: {} }
        )
        .then((result) => {
          localStorage.setItem("token_access", result.data.access);
        })
        .catch(() => {
          this.$emit("logOut");
        });
    },
  
    loadEditGuest: function (indice) {
      this.isEditGuestVisible = true;
      this.updateGuest = JSON.parse(JSON.stringify(this.guestList[indice]));
      this.idUpdate = this.updateGuest.doc_id;
    },
    closeEditGuest() {
      this.isEditGuestVisible = false;
    },
    loadAddGuest: function () {
      this.updateGuest = JSON.parse(JSON.stringify(this.guest));
      this.isAddGuestVisible = true;
    },
    closeAddGuest: function () {
      this.isAddGuestVisible = false;
    },
    showDetailGuest(indice) {
      this.detailGuest = this.guestList[indice];

      let date = new Date();
      date.setTime(Date.parse(this.detailGuest.birthdate));
      this.format_BD = date.toLocaleDateString('es-co');

      this.isDetailGuestVisible = true;
    },
    closeDetailGuest() {
      this.isDetailGuestVisible = false;
    },
   
    processDelete: async function (doc) {
      if(confirm(`¿Estas seguro de borrar el cliente?`)){
      await this.verifyToken();
      axios
        .delete(`http://127.0.0.1:8000/guest/${doc}/delete`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token_access")}`,
          },
        })
        .then((result) => {
          alert("Borrado con exito");
          this.guestList.length = 0;
          this.getData();
        })
        .catch((error) => {
          alert("Ocurrio un error al borrar el cliente" + error);
        });
      }
    },
  },

  created: async function () {
    this.getData();
  },
};
</script>

<style>


.form-add-guest input{
  margin-right: 5px;
  margin-top: 5px;
  height: 25px;
}

.form-add-guest select{
  width: 95px;
}

.form-add-guest button{
  margin-top: 25px;
}
.loadingMsg{
  margin:auto;
}
.noRooms{
  margin:auto;
}
.tableRooms{
  margin:auto;
}
.tableRooms td button {
  margin-right: 5px;
}
</style>
