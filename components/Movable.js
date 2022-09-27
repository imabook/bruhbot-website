import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

export default function Movable({ children }) {
	const [selected, setSelected] = useState(false);
	const [color, setColor] = useState("white");
	const [pos, setPos] = useState([0, 0.5, 0]);

	const ref = useRef();

	useEffect(() => {
		if (selected) {
			ref.current.children.forEach(o => o.material.color.set("orange"));
			return;
		}

		ref.current.children.forEach(o => o.material.color.set(color));
	}, [color, selected]);

	useFrame(state => {
		if (selected) {
			const floor = state.scene.children.find(
				e => e.className == "floor"
			);
			const collision = state.raycaster.intersectObject(floor);

			if (collision[0]) {
				setPos(collision[0].point.add(new Vector3(0, 0, 0)).toArray());
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
