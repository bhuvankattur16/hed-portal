import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function BackgroundParticles({ theme = "aurora" }) {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const getThemeColors = () => {
        switch (theme) {
            case "cyberpunk":
                return {
                    background: "transparent",
                    particles: "#ec4899", // Pink
                    links: "#06b6d4", // Cyan
                };
            case "darkAcademia":
                return {
                    background: "transparent",
                    particles: "#b45309", // Amber/Gold
                    links: "#78350f", // Dark Brown
                };
            case "aurora":
            default:
                return {
                    background: "transparent",
                    particles: "#6366f1", // Indigo
                    links: "#a855f7", // Purple
                };
        }
    };

    const colors = getThemeColors();

    const options = {
        background: { color: { value: colors.background } },
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: "grab",
                },
                resize: true,
            },
            modes: {
                grab: {
                    distance: 150,
                    links: { opacity: 0.6, color: colors.links },
                },
            },
        },
        particles: {
            color: { value: colors.particles },
            links: {
                color: colors.links,
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: false,
                speed: 1.2,
                straight: false,
            },
            number: {
                density: { enable: true, area: 800 },
                value: 60,
            },
            opacity: { value: 0.4 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
    };

    if (init) {
        return (
            <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
                <Particles id="tsparticles" options={options} className="w-full h-full" />
            </div>
        );
    }

    return null;
}
