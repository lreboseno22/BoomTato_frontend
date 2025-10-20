import kaboom from "kaboom";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function KaboomCanvas(){
    const { id } = useParams();

    useEffect(() => {
        // initialize kaboom canvas
        const k = kaboom({
            width: 800,
            height: 600,
            canvas: document.getElementById("kaboomCanvas"),
            background: [0, 0, 0],
        });

        k.add([
            k.text(`Game ${id} Started`),
            k.pos(200, 200),
        ]);

        return () => {
            document.getElementById("kaboomCanvas")?.remove();
        }
        
    }, [id]);

    return (
        <div className="kaboom-page">
            <canvas id="kaboomCanvas"></canvas>
        </div>
    )
}