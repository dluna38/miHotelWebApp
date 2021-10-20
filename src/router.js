import { createRouter, createWebHistory } from "vue-router";
import App from './App.vue';

import LogIn from './components/LogIn.vue'
import SignUp from './components/SignUp.vue'
import Home from './components/Home.vue'
import Account from './components/Account.vue'
import ListRoom from './components/ListRoom.vue'
import EditRoom from './components/EditRoom.vue'
import AddRoom from './components/AddRoom.vue'


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
        path: '/user/account',
        name: "account",
        component: Account
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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;