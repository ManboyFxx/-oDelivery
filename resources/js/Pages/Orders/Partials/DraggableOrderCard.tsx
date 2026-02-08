import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OrderCard, { Order, OrderAction } from './OrderCard';
import { isEqual } from 'lodash';

interface Props {
    order: Order;
    motoboys: any[];
    onAction: (action: OrderAction, order: Order) => void;
    onQuickView?: (order: Order) => void;
}

const DraggableOrderCard = memo(function DraggableOrderCard({ order, motoboys, onAction, onQuickView }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: order.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none"
        >
            <OrderCard
                order={order}
                motoboys={motoboys}
                onAction={onAction}
                onQuickView={onQuickView}
            />
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.order.id === nextProps.order.id &&
        prevProps.order.status === nextProps.order.status &&
        prevProps.order.payment_status === nextProps.order.payment_status &&
        prevProps.order.total === nextProps.order.total &&
        prevProps.order.items.length === nextProps.order.items.length &&
        isEqual(prevProps.motoboys, nextProps.motoboys)
    );
});

export default DraggableOrderCard;
