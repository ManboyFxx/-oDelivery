export default function ApplicationLogo(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo-icon.png"
            alt="ÓoDelivery"
            width="100" // Explicit dimension for CLS prevention
            height="100"
            loading="lazy"
            className="w-auto h-full object-contain"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
            {...props}
        />
    );
}
