<template>
  <button @click="loadAddReservation">Crear Reserva</button>
  <h3>Fecha actual: {{formatActualDate(fechaActual)}}</h3>
  <h2 class="noRooms" v-if="!reservationList.length && loaded">Sin reservas</h2>
  <h2 class="loadingMsg" v-if="!loaded">Cargando...</h2>
  <div class="tableRooms-container">
    <table class="tableRooms" v-if="reservationList.length && loaded">
      <tr>
        <th>Reserva N°</th>
        <th>Fecha de entrada</th>
        <th>Fecha de salida</th>
        <th>Cliente</th>
        <th>Habitación</th>
        <th>N° de huéspedes</th>
      </tr>
      <tr v-for="(rsv, index) in reservationList" v-bind:key="rsv.id">
        <td>{{ rsv.id }}</td>
        <td>{{ formatDate(rsv.check_in) }}</td>
        <td>{{ formatDate(rsv.check_out) }}</td>
        <td>{{ rsv.guest }}</td>
        <td>{{ rsv.room }}</td>
        <td>{{ rsv.num_guess }}</td>
        <td>
          <button v-on:click="showDetailGuest(index)">Detalle</button>
          <button v-on:click="showPaymentRsv(index)" disabled>Ver pago</button>
          <button v-on:click="loadEditReservation(index)" disabled>Editar</button>
          <button v-on:click="processDelete(rsv.id)">Eliminar</button>
        </td>
      </tr>
    </table>
  </div>

  <ModalGuest v-show="isAddReservationVisible" @close="closeAddReservation">
    <template v-slot:header>
      <h1>Crear Reserva</h1>
    </template>
    <template v-slot:body>
      <form v-on:submit.prevent="processAddReservation" class="form-add-rsv">
        <label for="froom">Habitación: </label>
        <select v-model="reservation.room" id="froom">
          <option disabled value="">Seleccione la habitación</option>
          <option v-for="rom in roomList" v-bind:key="rom.room_number">
            {{ rom.room_number }} - {{rom.room_type}}, Cap:{{rom.capacity}}, Est: {{rom.status_room}}
          </option>
        </select>
        <br />
        <label for="c-in">Fecha de ingreso: </label>
        <input type="datetime-local" v-model="reservation.check_in" id="c-in" />

        <label for="c-out">Fecha de salida: </label>
        <input
          type="datetime-local"
          v-model="reservation.check_out"
          id="c-out"
          v-on:blur="
            checkDates(
              reservation.room,
              reservation.check_in,
              reservation.check_out
            )
          "
        />
        <br />
        <label for="fguest">Cliente: </label>
        <select v-model="reservation.guest" id="fguest">
          <option disabled value="">Seleccione el cliente</option>
          <option v-for="gst in guestList" v-bind:key="gst.doc_id">
            {{ gst.doc_id }} - {{ gst.first_name }} {{ gst.last_name }}
          </option>
        </select>
        <label for="fng">N° de huespedes: </label>
        <input type="number" v-model="reservation.num_guess" id="fng" />
        <br />

        <button type="submit">Crear</button>
      </form>
    </template>
    <template v-slot:footer></template>
  </ModalGuest>
  <ModalGuest v-show="isDetailReservationVisible" @close="closeDetailReservation">
    <template v-slot:header>
      <h1>Crear Reserva</h1>
    </template>
    <template v-slot:body>
    </template>
    <template v-slot:footer></template>
  </ModalGuest>
</template>

<script>
import axios from "axios";
import ModalGuest from "./ModalGuest.vue";

export default {
  name: "ReservationList",
  components: {
    ModalGuest,
  },

  data: function () {
    return {
      updateReservation: {},
      reservationList: [],
      guestList: [],
      roomList: [],
      oldDates:[],
      newDates:[],
      reservation: {
        id: "",
        check_in: "",
        check_out: "",
        guest: "",
        room: "",
        num_guess: "",
      },
      fechaActual:"",
      isAddReservationVisible: false,
      isDetailReservationVisible: false,
      isEditReservationVisible: false,
      idUpdate: 0,
      loaded: false,
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
        .get(`http://127.0.0.1:8000/reservation/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((result) => {
          result.data.forEach((element) => {
            element.check_in = this.convertToDate(element.check_in);
            this.reservationList.push(element);
          });

          this.reservationList = this.formatOrder(this.reservationList);   
   
          this.loaded = true;
        })
        .catch((exce) => {
          console.log(exce);
          //this.$emit("logOut");
        });
    },
    convertToDate: function(date){
      var dateObj = new Date();
      dateObj.setTime(Date.parse(date));
      return dateObj;
    },
    formatOrder: function(array) {
      this.fechaActual= new Date();
      this.newDates= array.filter(rsv => rsv.check_in >= this.fechaActual);
      this.oldDates= array.filter(rsv => rsv.check_in <= this.fechaActual);
      return [].concat(this.newDates.reverse(),this.oldDates);
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
    processAddReservation: async function () {
      await this.verifyToken();
      this.reservation.guest = this.reservation.guest.split("-")[0].trim();
      this.reservation.room = this.reservation.room.split("-")[0].trim();
      if(this.reservation.check_in&&this.reservation.check_out&&this.reservation.room&&this.reservation.guest&&this.reservation.num_guess){
      axios
        .post("http://127.0.0.1:8000/reservation/create/", this.reservation, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token_access")}`,
          },
        })
        .then((result) => {
          alert("Reserva creada con exito");
          this.reservationList.length = 0;
          this.getData();
          this.closeAddReservation();
        })
        .catch((error) => {
          var msg="";
          if(error.response.data['msg']){
            msg+=error.response.data['msg'];
          }
          alert("ERROR: Fallo en la creacion de la reserva.\n" + msg);
        });
        this.reservation.room="";
        this.reservation.num_guess="";
        this.reservation.check_in="";
        this.reservation.check_out="";
      }
      else{
        alert('Algunos campos estan incompletos.')
      }
    },

    loadGuests: async function () {
      await this.verifyToken();

      this.guestList.length = 0;
      let token = localStorage.getItem("token_access");
      axios
        .get(`http://127.0.0.1:8000/guest/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((result) => {
          result.data.forEach((element) => {
            this.guestList.push(element);
          });
        })
        .catch((exce) => {
          console.log(exce);
        });
    },

    loadRooms: async function () {
      await this.verifyToken();
      this.roomList.length = 0;
      let token = localStorage.getItem("token_access");
      axios
        .get(`http://127.0.0.1:8000/room/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((result) => {
          result.data.forEach((element) => {
            this.roomList.push(element);
          });
        })
        .catch((exce) => {
          console.log(exce);
        });
    },
    verifyToken: function () {
      if (
        localStorage.getItem("token_access") === null ||
        localStorage.getItem("token_refresh") === null
      ) {
        this.$emit("logOut");
        return;
      }
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

    loadEditReservation: function (indice) {
      this.isEditReservationVisible = true;
      this.updateReservation = JSON.parse(
        JSON.stringify(this.reservationList[indice])
      );
      this.idUpdate = this.updateReservation.id;
    },
    closeEditReservation() {
      this.isEditReservationVisible = false;
    },
    loadAddReservation: function () {
      this.updateReservation = JSON.parse(JSON.stringify(this.reservation));
      this.loadGuests();
      this.loadRooms();
      this.isAddReservationVisible = true;
    },
    closeAddReservation: function () {
      this.isAddReservationVisible = false;
    },
    showDetailReservation(indice) {
      this.detailReservation = this.reservationList[indice];
      
      this.isDetailReservationVisible = true;
    },
    closeDetailReservation() {
      this.isDetailReservationVisible = false;
    },

    processDelete: async function (id) {
      if (confirm(`¿Estas seguro de borrar la reserva?`)) {
        await this.verifyToken();
        axios
          .delete(`http://127.0.0.1:8000/reservation/${id}/delete`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token_access")}`,
            },
          })
          .then((result) => {
            alert("Borrado con exito");
            this.reservationList.length = 0;
            this.getData();
          })
          .catch((error) => {
            alert("Ocurrio un error al borrar la reserva" + error);
          });
      }
    },
    formatDate: function (date, format = "es-co") {
      var dateObj = new Date();
      try {
        dateObj.setTime(Date.parse(date));
      } catch {
        return date;
      }
      //dateObj.toLocaleDateString(format);
      return Intl.DateTimeFormat(format, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(dateObj);
    },
    checkDates: async function (room, check_in, check_out) {
      await this.verifyToken();

      if (room && check_in && check_out) {
        room=room.split("-")[0].trim();
        console.log(room, check_in, check_out)        
        axios
          .get(
            "http://127.0.0.1:8000/reservation/create/",
            { 
              params: { room: room,check_in: check_in,check_out: check_out } ,
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token_access")}`,
              },
            })
          .then((result) => {
            console.log(result.data);
            if(!result.data['result']){
              alert('Al parecer ya existe una reserva para esa habitación en las mismas fechas')
            }
          })
          .catch((error) => {
            console.log(error);
            console.log(error.response.data);
          });
      }
    },
    formatActualDate:function(date){
      return Intl.DateTimeFormat("es-co", {
        year: "numeric",
        month: "long",
        weekday:"long",
        day: "numeric",
      }).format(date);
    }
  },
  created: async function () {
    this.fechaActual = new Date()
    this.getData();
  },
};
</script>

<style>
.form-add-rsv option {
  width: 15px;
}
</style>