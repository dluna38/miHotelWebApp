<template>
  <button @click="loadAddRoom">Añadir habitación</button>

  <h2 class= "noRooms" v-if="!rooms.length && loaded">Sin habitaciones registradas</h2>
  <h2 class="loadingMsg" v-if="!loaded">Cargando...</h2>
  <div class="tableRooms-container">
  <table class="tableRooms" v-if="rooms.length && loaded">
    <tr>
      <th>Numero de habitación</th>
      <th>Tipo de habitación</th>
      <th>Precio por noche</th>
      <th>Opciones</th>
    </tr>
    <tr v-for="(hab, index) in rooms" v-bind:key="hab.room_number">
      <td>{{ hab.room_number }}</td>
      <td>{{ hab.room_type }}</td>
      <td>{{ hab.price }} {{ hab.price_currency }}</td>
      <td>
        <button v-on:click="showDetailModal(index)">Detalle</button>
        <button v-on:click="showEditRoom(index)">Editar</button>
        <button v-on:click="processDelete(hab.room_number)">Eliminar</button>
      </td>
    </tr>
  </table>
  </div>
  <ModalDetailRoom v-show="isModalDetailVisible" @close="closeDetailModal">
    <template v-slot:header>
      <h1>Habitación #{{ detailRoom.room_number }}</h1>
    </template>
    <template v-slot:body>
      <p>Tipo de habitación: {{ detailRoom.room_type }}</p>
      <p>Servicios: {{ detailRoom.room_description }}</p>
      <p>Precio: {{ detailRoom.price }} {{ detailRoom.price_currency }}</p>
      <p>Capacidad: {{ detailRoom.capacity }}</p>
      <p>Estado actual: {{ detailRoom.status_room }}</p>
    </template>
    <template v-slot:footer></template>
  </ModalDetailRoom>
  <EditRoom v-show="isEditRoomVisible">
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
  </EditRoom>
</template>


<script>
import axios from "axios";
import ModalDetailRoom from "./ModalDetailRoom.vue";
import EditRoom from "./EditRoom.vue";

export default {
  name: "ListRoom",
  inheritAttrs: false,
  components: {
    ModalDetailRoom,
    EditRoom,
  },

  data: function () {
    return {
      detailRoom: {},
      updateRoom: {},
      rooms: [],
      room: {
        room_number: "",
        room_type: "",
        room_description: "",
        price_currency: "",
        capacity: 0,
        price: 0,
        status_room: "",
      },
      isModalDetailVisible: false,
      isEditRoomVisible: false,
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
        .get(`https://proyecto-ciclo3-hotel.herokuapp.com/room/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((result) => {
          result.data.forEach((element) => {
            var obj = Object.create(this.room);
            obj.room_number = element.room_number;
            obj.room_type = element.room_type;
            obj.room_description = element.room_description;
            obj.capacity = element.capacity;
            obj.price = element.price;
            obj.status_room = element.status_room;
            obj.price_currency = element.price_currency;
            this.rooms.push(obj);
          });
          this.loaded = true;
        })
        .catch((exce) => {
          console.log("error : " + exce);

          //this.$emit("logOut");
        });
    },
    processUpdateRoom: async function(){
      await this.verifyToken();
      axios
        .put(`https://proyecto-ciclo3-hotel.herokuapp.com/room/${this.idUpdate}/update`, this.updateRoom, {
             headers: {Authorization: `Bearer ${localStorage.getItem("token_access")}`} 
            })
        .then((result) => {      
          alert("Habitación actualizada con exito")
          this.updateRoom.length = 0;
          this.rooms.length = 0;
          this.getData();
          this.closeEditRoom();
        })
        .catch((error) => {
          console.log(error.response.data);
          if(error.response.data.room_number) alert('ERROR: Ya existe una habitación con ese numero')
          else alert("ERROR: Fallo en la actualización.\n" + error);
        });
      
    },
    verifyToken: function () {
      return axios
        .post(
          "https://proyecto-ciclo3-hotel.herokuapp.com/refresh/",
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
  
    loadEditRoom: function () {
      this.$router.push({ name: "editRoom" });
    },
    loadAddRoom: function () {
      this.$router.push({ name: "addRoom" });
    },
    showDetailModal(indice) {
      this.detailRoom = this.rooms[indice];
      this.isModalDetailVisible = true;
    },
    closeDetailModal() {
      this.isModalDetailVisible = false;
    },
    showEditRoom(indice) {
      this.updateRoom = JSON.parse(JSON.stringify(this.rooms[indice]));
      this.idUpdate = this.updateRoom.room_number;
      this.isEditRoomVisible = true;
    },
    closeEditRoom() {
      this.isEditRoomVisible = false;
    },
    processDelete: async function (room_number) {
      if(confirm(`¿Estas seguro de borrar la habitación ${room_number}?`)){
      await this.verifyToken();
      axios
        .delete(`https://proyecto-ciclo3-hotel.herokuapp.com/room/${room_number}/delete`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token_access")}`,
          },
        })
        .then((result) => {
          alert("Borrado con exito");
          this.rooms.length = 0;
          this.getData();
        })
        .catch((error) => {
          alert("Ocurrio un error al borrar la habitación" + error);
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
