import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

export default function Movable({ children }) {
	const ROOM_SIZE = 10;
	const SCALE = new Vector3(1, 1, 1);

	const [selected, setSelected] = useState(false);
	const [color, setColor] = useState("white");
	const [pos, setPos] = useState([0, 0, 0]);

	const [offset, setOffset] = useState(new Vector3(0, 0, 0));

	const [frame, setFrame] = useState(0);
	const { clock } = useThree();

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

		setOffset(
			new Vector3()
				.copy(ref.current.children[0].position)
				.setY(0)
				.multiplyScalar(-1)
		);
	}, []);

	useFrame(state => {
		let position_vector = new Vector3().fromArray(pos).setY(0);
		let height = 0;

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

				position_vector = new Vector3(x, 0, z);
			}

			// calculation of animations
			height = Math.sin((state.clock.elapsedTime - frame) * 5) / 10;
		}
		setPos(position_vector.add(new Vector3(0, height, 0)).toArray());
	});

	return (
		<mesh
			ref={ref}
			position={pos}
			onPointerEnter={_ => setColor("hotpink")}
			onPointerLeave={_ => setColor("white")}
			// a lo mejor tengo que cambiar esto por onPointerDown y onPointerUp para telefono xd
			onClick={_ => {
				if (selected) {
					setColor("hotpink");
				} else {
					setColor("orange");
				}
				setFrame(clock.elapsedTime);
				setSelected(!selected);
			}}
		>
			{children}
		</mesh>
	);
}
