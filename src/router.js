import { createRouter, createWebHistory } from "vue-router";
import App from './App.vue';

import LogIn from './components/LogIn.vue'
import SignUp from './components/SignUp.vue'
import Home from './components/Home.vue'
import ListRoom from './components/ListRoom.vue'
import EditRoom from './components/EditRoom.vue'
import AddRoom from './components/AddRoom.vue'
import GuestList from './components/GuestList.vue'
import ReservationList from './components/ReservationList.vue'

const routes = [{
        path: '/',
        name: 'root',
        component: App
    },
    {
        path: '/user/logIn',
        name: "logIn",
        component: LogIn
    },
    {
        path: '/user/signUp',
        name: "signUp",
        component: SignUp
    },
    {
        path: '/user/home',
        name: "home",
        component: Home
    },
    {
        path: '/room',
        name: "room",
        component: ListRoom
    },
    {
        path: '/room/#/edit',
        name: "editRoom",
        component: EditRoom
    },
    {
        path: '/room/create',
        name: "addRoom",
        component: AddRoom
    },
    {
        path: '/guest',
        name: "guestList",
        component: GuestList
    },
    {
        path: '/reservation',
        name: "reservationList",
        component: ReservationList
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;