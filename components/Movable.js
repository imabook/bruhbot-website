import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

export default function Movable({ children }) {
	const ROOM_SIZE = 10;
	const SCALE = new Vector3(1, 1, 1);

	const [selected, setSelected] = useState(false);
	const [color, setColor] = useState("white");
	const [pos, setPos] = useState([0, 0, 0]);
	const [offset, setOffset] = useState(new Vector3(0, 0, 0));

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

		setOffset(
			new Vector3()
				.copy(ref.current.children[0].position)
				.setY(0)
				.multiplyScalar(-1)
		);
	}, []);

	useFrame(state => {
		//ss console.log(ref.current.position);

		if (selected) {
			const floor = state.scene.children.find(
				e => e.className == "floor"
			);
			const collision = state.raycaster.intersectObject(floor);

			if (collision[0]) {
				// position calculation and things like that
				// with offsets and collisions (kinda)

				let x = collision[0].point.x + offset.x;
				let z = collision[0].point.z + offset.z;

				console.log(x, z);

				if (collision[0].point.x > ROOM_SIZE / 2 - SCALE.x / 2) {
					x = ROOM_SIZE / 2 - SCALE.x / 2 + offset.x;
				} else if (collision[0].point.x < SCALE.x / 2 - ROOM_SIZE / 2) {
					x = SCALE.x / 2 - ROOM_SIZE / 2 + offset.x;
				}

				if (collision[0].point.z > ROOM_SIZE / 2 - SCALE.z / 2) {
					z = ROOM_SIZE / 2 - SCALE.z / 2 + offset.z;
				} else if (collision[0].point.z < SCALE.z / 2 - ROOM_SIZE / 2) {
					z = SCALE.z / 2 - ROOM_SIZE / 2 + offset.z;
				}

				setPos(
					new Vector3(x, 0, z).add(new Vector3(0, 0, 0)).toArray()
				);
			}
		}
	});

	return (
		<mesh
			ref={ref}
			position={pos}
			onPointerEnter={_ => setColor("hotpink")}
			onPointerLeave={_ => setColor("white")}
			onClick={_ => {
				if (selected) {
					setColor("hotpink");
				} else {
					setColor("orange");
				}
				setSelected(!selected);
			}}
		>
			{children}
		</mesh>
	);
}
