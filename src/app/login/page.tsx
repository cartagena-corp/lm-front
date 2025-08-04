import { API_ROUTES } from "@/lib/core/routes/oauth.route"
import { GoogleIcon } from "@public/icon/Icon"
import Link from "next/link"

export default function Login() {
    return (
        <main className="bg-[#101828] flex justify-center items-center h-screen">
            <section className="bg-[#1c398e] text-[#ffffff] flex flex-col justify-center items-center rounded-l-md w-lg min-h-[500px] gap-2">
                <h2 className="font-bold text-4xl">La Muralla</h2>
                <p className="font-light text-center text-sm max-w-100">Potencia la productividad de tu equipo con una gestión de tareas eficiente y profesional.</p>
            </section>
            <section className="bg-[#ffffff] text-[#101828] flex flex-col justify-center items-center rounded-r-md w-lg min-h-[500px] gap-6 p-16">
                <article className="flex flex-col justify-center items-start w-full">
                    <h4 className="font-bold text-2xl">Bienvenido</h4>
                    <p className="text-[#7f7f7f]">Inicia sesión para acceder a tu cuenta</p>
                </article>

                <Link href={API_ROUTES.LOGIN_GOOGLE} className="hover:bg-[#f2f2f2] border-[#cecece] flex justify-center items-center cursor-pointer transition-colors rounded-md border w-full gap-4 py-2">
                    <GoogleIcon size={20} />
                    Inicia sesión con Google
                </Link>

                <span className="text-center text-xs">
                    Al iniciar sesión, aceptas los <b className="hover:underline cursor-pointer">Términos y condiciones</b> y
                    <br /> <b className="hover:underline cursor-pointer">Política de privacidad</b>.
                </span>
            </section>
        </main>
    )
}
