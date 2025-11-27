import { BeamsBackground } from "@/components/ui/beams-background";

export function BeamsBackgroundDemo() {
    return (
        <BeamsBackground>
            <div className="flex flex-col items-center justify-center gap-6 px-4 text-center">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold text-white tracking-tighter">
                    Beams
                    <br />
                    Background
                </h1>
                <p className="text-lg md:text-2xl lg:text-3xl text-white/70 tracking-tighter">
                    For your pleasure
                </p>
            </div>
        </BeamsBackground>
    );
}
