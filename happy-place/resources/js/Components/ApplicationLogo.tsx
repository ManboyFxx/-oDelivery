export default function ApplicationLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <img
            src="/images/logo-icon.png"
            alt="ÓoDelivery"
            className="w-auto h-full object-contain"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
            {...props as any}
        />
    );
}
