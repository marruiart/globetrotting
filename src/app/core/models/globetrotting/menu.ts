let homeItem = {
    label: 'Inicio',
    icon: 'custom-icon home-outline',
    routerLink: ['/home']
}

let destinationsItem =
{
    label: 'Destinos',
    icon: 'custom-icon paper-plane-outline',
    routerLink: ['/destinations']
}

let managingItem = {
    label: 'Gestión',
    icon: 'custom-icon briefcase-outline',
    items: [
        {
            label: 'Gestionar reservas',
            icon: 'custom-icon calendar-outline',
            routerLink: ['/profile']
        },
        {
            label: 'Gestionar destinos',
            icon: 'custom-icon trail-sign-outline',
            routerLink: ['/home']
        }
    ],
    styleClass: "login-btn"
}

let adminManagingItem = {
    label: managingItem.label,
    icon: managingItem.icon,
    items: [
        managingItem.items[0],
        managingItem.items[1],
        {
            label: 'Gestionar agentes',
            icon: 'custom-icon people-outline',
            routerLink: ['/home']
        }
    ],
    styleClass: managingItem.styleClass
}

let loginItem = {
    label: 'Login',
    icon: 'custom-icon person-outline',
    routerLink: ['/login'],
    styleClass: "login-btn"
}

let userProfileItem = {
    icon: 'custom-icon person-outline',
    items: [
        {
            label: 'Mi perfil',
            icon: 'custom-icon person-circle-outline',
            routerLink: ['/profile']
        },
        {
            label: 'Salir',
            icon: 'custom-icon log-in-outline',
            routerLink: ['/home']
        }
    ],
    styleClass: "login-btn"
}

let clientProfileItem = {
    icon: userProfileItem.icon,
    items: [
        userProfileItem.items[0],
        {
            label: 'Mis reservas',
            icon: 'custom-icon calendar-outline',
            routerLink: ['/profile']
        },
        userProfileItem.items[1]
    ],
    styleClass: userProfileItem.styleClass
}

export let menuItems = {
    public: [
        homeItem,
        destinationsItem,
        loginItem
    ],
    client: [
        homeItem,
        destinationsItem,
        clientProfileItem
    ],
    agent: [
        homeItem,
        destinationsItem,
        managingItem,
        userProfileItem
    ],
    admin: [
        homeItem,
        destinationsItem,
        adminManagingItem,
        userProfileItem
    ]
};

