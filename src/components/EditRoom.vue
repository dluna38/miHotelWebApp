<template>
  <div class="signUp_user">
    <div class="container_signUp_user">
      <h2>Editar habitación</h2>
      <slot name=form>
      <form v-on:submit.prevent="processAddRoom">
        <input type="number" v-model="room.room_number" placeholder="Ej. 101" />
        <br/>
        <select v-model="room.room_type">
          <option disabled value="">Seleccione un elemento</option>
          <option>IND</option>
          <option>FAM</option>
          <option>DOB</option>
          <option>OTR</option>
        </select>
        <br />
        <input type="text" v-model="room.room_description" placeholder="Ej. TV" />
        <br />
        <input type="number" v-model="room.capacity" placeholder="Ej. 1" />
        <br />
        <input type="number" v-model="room.price" placeholder="Ej. 20000" />
        <br />
        <select v-model="room.status_room">
          <option disabled value="">Seleccione un elemento</option>
          <option>DIS</option>
          <option>OCU</option>
          <option>MAN</option>
          <option>DES</option>
        </select>
        <br />
        <button type="submit">Actualizar</button>
        <!-- <button @click="cancel">Cancelar</button> -->
      </form>
      </slot>
    </div>
  </div>
</template>




<script>
import axios from "axios";

export default {
  name: "AddRoom",
  data: function () {
    return {
      room: {
        room_number: "",
        room_type: "",
        room_description: "",
        price_currency: "",
        capacity: 0,
        price: 0,
        status_room: "",
      },
    };
  },

  methods: {
    processAddRoom: function () {
      axios
        .update(`http://127.0.0.1:8000/room/${this.room_number}/update`, this.room, {
             headers: {Authorization: `Bearer ${localStorage.getItem("token_access")}`} 
            })
        .then((result) => {
          alert("Habitación actualizada con exito")
          this.$router.push({ name: "room" });
        })
        .catch((error) => {
          console.log(error);
          alert("ERROR: Fallo en la actualización.\n" + error);
        });
    },
    cancel(){
      this.$emit("cancel")
    }
  },
};
</script>






<style>

.signUp_user {
  background-color: rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0%;
  height: 80%;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
}

.container_signUp_user {
  background-color: antiquewhite;
  border: 3px solid #283747;
  border-radius: 10px;
  width: 25%;
  height: 35%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.signUp_user h2 {
  color: #283747;
}

.signUp_user form {
  width: 70%;
}

.signUp_user input,select{
  height: 40px;
  width: 100%;

  box-sizing: border-box;
  padding: 10px 20px;
  margin: 5px 0;

  border: 1px solid #283747;
}

.signUp_user button {
  width: 100%;
  height: 40px;

  color: #e5e7e9;
  background: #283747;
  border: 1px solid #e5e7e9;

  border-radius: 5px;
  padding: 10px 25px;
  margin: 3px 0 5px 0;
}

.signUp_user button:hover {
  color: #e5e7e9;
  background: crimson;
  border: 1px solid #283747;
}
</style>