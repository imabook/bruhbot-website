import { atom } from "jotai";

const roomAtom = atom([
	{ id: 0, scale: [1, 1, 1], position: [0, 0.5, 2], type: "movable" },
	{ id: 1, scale: [1, 1, 1], position: [1.5, 0.5, 0], type: "movable" },
	{ id: 2, scale: [1, 1, 1], position: [0, 0.5, 0], type: "movable" },
	{ id: 3, scale: [2, 1, 0.5], position: [4, 0.5, 0], type: "movable" },
]);
export { roomAtom };

// estructura:
// tengo que tener mucho cuidado y saber de donde pillar la posicion, vertice izquierda abajo 👍 o en medio de la figura 😨
/* 
objetos = [
    {
        id: (int) ..., // this is the id of the object in the room (each object has its own id)
        objectId: (int) ..., // this would be the id from the db
        modelo: ..., 
        escala: (int[3]) ...,
        posicion: (int[3]) ...,
        type: 'movable' | 'hangable',
        // si necesito algo mas ya lo añadire xd
        // si modelo/escala falta pillar desde la db con la id (objectId)
    }
]
*/
