import { DoubleSide } from "three";

export default function Room({ size = 10 }) {
	return (
		<>
			<mesh
				receiveShadow
				className={"subfloor"}
				rotation={[-Math.PI / 2, 0, 0]}
			>
				<planeBufferGeometry args={[1000, 1000]} />
				<meshBasicMaterial transparent={true} opacity={0} />
			</mesh>

			<mesh
				receiveShadow
				className={"floor"}
				rotation={[-Math.PI / 2, 0, 0]}
			>
				<planeBufferGeometry args={[size, size]} />
				<meshStandardMaterial
					side={DoubleSide}
					wireframeLinewidth={2}
					color={"lightgray"}
				/>
			</mesh>

			{/* por ahora dejo que la altura de la sala sea constante (5) pero acabare cambiandolo supongoxd */}
			<mesh position={[0, 2.5, -size / 2]}>
				<planeBufferGeometry args={[size, 5]} />
				<meshStandardMaterial color={"lightgray"} />
			</mesh>
			<mesh position={[0, 2.5, size / 2]} rotation={[0, Math.PI, 0]}>
				<planeBufferGeometry args={[size, 5]} />
				<meshStandardMaterial color={"lightgray"} />
			</mesh>
			<mesh position={[-size / 2, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
				<planeBufferGeometry args={[size, 5]} />
				<meshStandardMaterial color={"lightgray"} />
			</mesh>
			<mesh position={[size / 2, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
				<planeBufferGeometry args={[size, 5]} />
				<meshStandardMaterial color={"lightgray"} />
			</mesh>
		</>
	);
}
