import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

import { moveAtom } from "../atoms/moveAtom";
import { useAtom } from "jotai";
import { roomAtom } from "../atoms/roomAtom";

export default function Movable({ id, scale, children, position }) {
	// constants (room size & object overall size)
	const ROOM_SIZE = 10;
	const SCALE = scale ? new Vector3().fromArray(scale) : new Vector3(1, 1, 1); // kinda like the hitbox xd

	// normal state shit -> selected, color change and position of the object
	const [selected, setSelected] = useState(false);
	const [color, setColor] = useState("white");

	position = [...position]; // creating a copy of the array so the og one doesnt change and messes with the pos
	position[1] = 0;
	const [pos, setPos] = useState(position);

	// offset para siempre renderizar el medio del objeto donde se encuentra el puntero
	const [offset, setOffset] = useState(new Vector3(0, 0, 0));

	// frames para las animaciones de arriba y abajo cuando tienes el objeto seleccionado
	const [frame, setFrame] = useState(0);
	const { clock } = useThree();

	// atom para comunicar con el parent si hay un objeto selecionado y no mover la sala
	const [move, setMove] = useAtom(moveAtom);
	// atom para saber donde estan puestos los objetos y actualizarlos de posicion
	const [room, setRoom] = useAtom(roomAtom);

	// ref para sacar los children y cambiarles de color y calcular el offset
	const ref = useRef();

	useEffect(() => {
		if (selected) {
			ref.current.children.forEach(o => o.material.color.set("orange"));
			return;
		}

		ref.current.children.forEach(o => o.material.color.set(color));
	}, [color, selected]);

	useEffect(() => {
		// multiplyscalar(-1) porque offset = posicion final - posicion inicial,
		// si la posicion final tiene que ser (0, 0, 0) la ecuacion se queda como
		// offset = - posicion inicial

		// podria simplemente restar el valor en los calculos de la colision pero queda mas duro asi 🐠

		let offsetX = [null, null]; // first value: min; last value: max
		let offsetZ = [null, null]; // first value: min; last value: max

		// this gets the outer bounds
		// like the hitbox but it cares for the position
		// because it has to cancel that position for it to really get in the middle
		// aka (0, 0, 0)
		ref.current.children.forEach(c => {
			if (offsetX[0] == null || c.position.x < offsetX[0]) {
				offsetX[0] = c.position.x;
			}
			if (offsetX[1] == null || c.position.x > offsetX[1]) {
				offsetX[1] = c.position.x;
			}

			if (offsetZ[0] == null || c.position.z < offsetZ[0]) {
				offsetZ[0] = c.position.z;
			}
			if (offsetZ[1] == null || c.position.z > offsetZ[1]) {
				offsetZ[1] = c.position.z;
			}
		});

		setOffset(
			// la media de los dos porque queremos centrar el punto del medio

			new Vector3(
				(offsetX[0] + offsetX[1]) / 2,
				0,
				(offsetZ[0] + offsetZ[1]) / 2
			).multiplyScalar(-1)
		);
	}, []);

	useFrame(state => {
		let position_vector = new Vector3().fromArray(pos).setY(0);
		let height = 0;

		if (selected) {
			const floor = state.scene.children.find(
				e => e.className == "subfloor"
			);
			const collision = state.raycaster.intersectObject(floor);

			// let temp_position_vector =
			// 	calcMovement(collision[0]) || position_vector;
			// position_vector = calcCollision(temp_position_vector)
			// 	? position_vector
			// 	: temp_position_vector;

			// if (collision[0]) {
			// 	// podria hacer collision[0]?. y queda hasta mejor pero no se si es necesariamente mejor xd
			// 	let x = collision[0].point.x + offset.x;
			// 	let z = collision[0].point.z + offset.z;
			// 	position_vector = new Vector3(x, 0, z);
			// }

			position_vector = calcCollision2(collision[0]) || position_vector;

			// position_vector = calcMovement(collision[0]) || position_vector;
			// position_vector.sub(calcCollision(position_vector, collision[0]));

			// calculation of animations
			height = 0.1 + Math.sin((state.clock.elapsedTime - frame) * 5) / 10;
		}

		setPos(position_vector.add(new Vector3(0, height, 0)).toArray());
	});

	const calcMovement = col => {
		if (col) {
			// position calculation and things like that
			// with offsets and collisions (kinda)

			let x = col.point.x + offset.x;
			let z = col.point.z + offset.z;

			if (col.point.x > ROOM_SIZE / 2 - SCALE.x / 2) {
				x = ROOM_SIZE / 2 - SCALE.x / 2 + offset.x;
			} else if (col.point.x < SCALE.x / 2 - ROOM_SIZE / 2) {
				x = SCALE.x / 2 - ROOM_SIZE / 2 + offset.x;
			}

			if (col.point.z > ROOM_SIZE / 2 - SCALE.z / 2) {
				z = ROOM_SIZE / 2 - SCALE.z / 2 + offset.z;
			} else if (col.point.z < SCALE.z / 2 - ROOM_SIZE / 2) {
				z = SCALE.z / 2 - ROOM_SIZE / 2 + offset.z;
			}

			return new Vector3(x, 0, z);
		}
	};

	const calcCollision = (pos, col) => {
		// console.log(pos, col.point);

		// 	const offsetAware = col.point.clone().add(offset.clone());
		// 	let collisionOffset = new Vector3(0, 0, 0);
		// 	// console.log(pos, offset, offsetAware);

		let colisions = false;
		let offsets = [];

		// 	// pos.multiplyScalar(-1);

		for (let o of room) {
			if (o.id == id) continue;

			if (
				o.position[0] + o.scale[0] / 2 > col.point.x - SCALE.x / 2 &&
				o.position[0] - o.scale[0] / 2 < col.point.x + SCALE.x / 2 &&
				o.position[2] + o.scale[2] / 2 > col.point.z - SCALE.z / 2 &&
				o.position[2] - o.scale[2] / 2 < col.point.z + SCALE.z / 2
			) {
				// corrige del lado que menos tenga que mover
				// if (
				// 	Math.abs(o.position[2] - col.point.z) >=
				// 	Math.abs(o.position[0] - col.point.x)
				// ) {
				// 	// un poco de magia pero ya lo entiendo xd es ez
				// 	// si el german del futuro no sabe que he hecho aqui que se joda
				// 	offsets.push(
				// 		new Vector3(
				// 			0,
				// 			0,
				// 			-Math.sign(o.position[2] - col.point.z) -
				// 				o.position[2] -
				// 				col.point.z
				// 		)
				// 	);
				// } else {
				// 	offsets.push(
				// 		new Vector3(
				// 			-Math.sign(o.position[0] - col.point.x) -
				// 				o.position[0] -
				// 				col.point.x,
				// 			0,
				// 			0
				// 		)
				// 	);
				// }

				colisions = true;
				break;
			}
		}

		if (col.point.x > ROOM_SIZE / 2 - SCALE.x / 2) {
			colisions = true;
		} else if (col.point.x < SCALE.x / 2 - ROOM_SIZE / 2) {
			colisions = true;
		}

		if (col.point.z > ROOM_SIZE / 2 - SCALE.z / 2) {
			colisions = true;
		} else if (col.point.z < SCALE.z / 2 - ROOM_SIZE / 2) {
			colisions = true;
		}

		if (!colisions) {
			let x = col.point.x + offset.x;
			let z = col.point.z + offset.z;
			return new Vector3(x, 0, z);
		}

		// 			// console.log(col.point);
		// 			collisionOffset.add(
		// 				new Vector3().fromArray(o.position).setY(0).sub(col.point)
		// 			);

		// 			if (
		// 				Math.abs(collisionOffset.x) >= Math.abs(collisionOffset.z)
		// 			) {
		// 				// un poco de magia pero ya lo entiendo xd es ez
		// 				// si el german del futuro no sabe que he hecho aqui que se joda
		// 				collisionOffset = new Vector3(
		// 					Math.sign(collisionOffset.x) * 1 - collisionOffset.x,
		// 					0,
		// 					0
		// 				);
		// 			} else {
		// 				collisionOffset = new Vector3(
		// 					0,
		// 					0,
		// 					Math.sign(collisionOffset.z) * 1 - collisionOffset.z
		// 				);
		// 			}

		// 			// break;
		// 		}
		// 	}

		// 	console.log(colisions);

		// 	return collisionOffset;
	};

	const calcCollision2 = col => {
		let colidingX,
			colidingZ = (false, false);
		let mouseColidingX,
			mouseColidingZ = (false, false);

		for (let o of room) {
			if (o.id == id) continue;

			if (
				o.position[0] + o.scale[0] / 2 > pos[0] - SCALE.x / 2 &&
				o.position[0] - o.scale[0] / 2 < pos[0] + SCALE.x / 2 &&
				o.position[2] + o.scale[2] / 2 > pos[2] - SCALE.z / 2 &&
				o.position[2] - o.scale[2] / 2 < pos[2] + SCALE.z / 2
			) {
				colidingX = true;
				colidingZ = true;
			}

			if (
				o.position[0] + o.scale[0] / 2 > col.point.x - SCALE.x / 2 &&
				o.position[0] - o.scale[0] / 2 < col.point.x + SCALE.x / 2 &&
				o.position[2] + o.scale[2] / 2 > col.point.z - SCALE.z / 2 &&
				o.position[2] - o.scale[2] / 2 < col.point.z + SCALE.z / 2
			) {
				mouseColidingX = true;
				mouseColidingZ = true;
			}
		}

		if (pos[0] > ROOM_SIZE / 2 - SCALE.x / 2) {
			colidingX = true;
		} else if (pos[0] < SCALE.x / 2 - ROOM_SIZE / 2) {
			colidingX = true;
		}

		if (pos[2] > ROOM_SIZE / 2 - SCALE.z / 2) {
			colidingZ = true;
		} else if (pos[2] < SCALE.z / 2 - ROOM_SIZE / 2) {
			colidingZ = true;
		}

		if (col.point.x > ROOM_SIZE / 2 - SCALE.x / 2) {
			mouseColidingX = true;
		} else if (col.point.x < SCALE.x / 2 - ROOM_SIZE / 2) {
			mouseColidingX = true;
		}

		if (col.point.z > ROOM_SIZE / 2 - SCALE.z / 2) {
			mouseColidingZ = true;
		} else if (col.point.z < SCALE.z / 2 - ROOM_SIZE / 2) {
			mouseColidingZ = true;
		}

		console.log(colidingX, colidingZ);

		let x = colidingX && mouseColidingX ? pos[0] : col.point.x + offset.x;
		let z = colidingZ && mouseColidingZ ? pos[2] : col.point.z + offset.z;
		return new Vector3(x, 0, z);
	};

	const isFirstCollision = intersection => {
		return intersection ? intersection.eventObject == ref.current : false;
	};

	return (
		<mesh
			ref={ref}
			position={pos}
			onPointerMove={e => {
				// codigo para el highlight xd

				isFirstCollision(e.intersections[0]) && move
					? setColor("hotpink")
					: setColor("white");
			}}
			onPointerLeave={_ => setColor("white")}
			onPointerDown={e => {
				if (isFirstCollision(e.intersections[0])) {
					if (move) {
						// si se puede rotar significa que no hay otro objeto selecionado
						setColor("orange");
						setFrame(clock.elapsedTime);
						setSelected(true);

						setMove(false); // stops the rotation of the room
					}
				}
			}}
			onPointerUp={_ => {
				if (selected) {
					// por si esta selecionado otro objeto y se cambia el setMove erroneamente
					setColor("hotpink");
					setSelected(false);

					// console.log(room);

					// console.log(
					// 	[...room].map(o => {
					// 		if (o.id == id) {
					// 			o.position = pos;
					// 		}
					// 		return o;
					// 	})
					// );

					setMove(true); // stops the rotation of the room
				}
			}}
		>
			{children}
		</mesh>
	);
}
