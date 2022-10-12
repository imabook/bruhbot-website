import { useAtom } from "jotai";
import { roomAtom } from "../atoms/roomAtom";
import Movable from "./Movable";

export default function Objects() {
	const [room, _] = useAtom(roomAtom);

	return (
		<>
			{room.map(o => {
				// if (o.type == "movable") {
				return (
					// id & key?? xd
					<Movable id={o.id} key={o.id} scale={o.scale}>
						<mesh castShadow position={o.position}>
							<boxBufferGeometry args={o.scale} />
							<meshStandardMaterial color={"lightblue"} />
						</mesh>
					</Movable>
				);
				// }
			})}
		</>
	);
}
