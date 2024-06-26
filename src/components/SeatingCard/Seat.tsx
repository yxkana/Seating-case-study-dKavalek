import { eventData, seatsData, useIsMobile } from "@/hooks";
import React from "react";
import { useFormatPrice } from "@/hooks";
import { CoinsIcon, TicketIcon } from "../icons";
import classNames from "classnames";
import useTicketCartStore, { CartItem } from "@/stores/TicketCartStore";
import { closePopup } from "@/lib/utils";
import { MapPin } from "lucide-react";

type SeatData = Pick<seatsData, "seatRows">;
type TicketType = Pick<seatsData, "ticketTypes">;
type TicketOnly = TicketType["ticketTypes"][number];
type SeatOnly = SeatData["seatRows"][number]["seats"][number];

interface SeatProps extends React.HTMLAttributes<HTMLElement> {
  event: eventData;
  seat: SeatOnly;
  rowNumber: number;
  ticketType: TicketOnly[];
}
export const Seat = React.forwardRef<HTMLDivElement, SeatProps>(
  (props, ref) => {
    const priceFormat = useFormatPrice();
    const isMobile = useIsMobile();
    const { addTicket, cartTicketsItems, removeTicket } = useTicketCartStore(
      (state) => state,
    );

    /* Checking if seat is in shopping cart */
    const isInCart = (): boolean => {
      return (
        cartTicketsItems.find(
          (ticket) => ticket.tickets.seatId === props.seat.seatId,
        ) !== undefined
      );
    };

    /* Show correct type of ticket */
    const showTicketType = () => {
      return props.ticketType.filter(
        (item) => item.id !== props.seat.ticketTypeId,
      )[0];
    };
    const ticket: TicketOnly = showTicketType();

    /* Creating object for shopping cart */
    const cartSeat: CartItem = {
      eventId: props.event.eventId,
      eventName: props.event.namePub,
      tickets: {
        ticketType: ticket.name,
        price: ticket.price,
        seatId: props.seat.seatId,
        ticketTypeId: props.seat.ticketTypeId,
      },
    };

    return (
      <div
        className={classNames(
          "dropdown",
          {
            "dropdown-left": props.seat.place > 4 && isMobile,
          },
          { "dropdown-right": props.seat.place < 4 && isMobile },
        )}
      >
        {/* Dropdown seat button */}
        <div
          tabIndex={0}
          role="button"
          className={classNames(
            "my-1 text-white hover:cursor-pointer",
            {
              "flex size-8 flex-col items-center justify-center rounded-xl shadow-md":
                !isMobile,
            },
            { "my-0 size-4 rounded-full": isMobile },
            { "bg-info": isInCart() === true },
            {
              "bg-vipTicket-100":
                ticket.name === "VIP ticket" && isInCart() !== true,
            },
            {
              "bg-regularTicket-100":
                ticket.name === "Regular ticket" && isInCart() !== true,
            },
          )}
          ref={ref}
        >
          {/* Seat number */}
          <span className="text-xs font-medium">
            {!isMobile && props.seat.place}
          </span>
        </div>
        {/* Seat dropdown */}
        <div
          tabIndex={0}
          className={classNames(
            "card dropdown-content card-compact z-[1] w-52 bg-neutral p-2 shadow",
            { "w-44": isMobile },
          )}
        >
          <div className="flex flex-col gap-2 pb-4 pt-2">
            <div className="flex gap-2 font-semibold">
              <TicketIcon />
              <p>{ticket.name}</p>
            </div>
            <div className="flex gap-2 text-sm font-medium">
              <CoinsIcon />
              <p>{priceFormat.format(ticket.price)}</p>
            </div>
            <div className="flex gap-2 text-sm font-medium">
              <MapPin />
              <p>{`${props.rowNumber}-${props.seat.place}`}</p>
            </div>
          </div>

          <div className="flex flex-col">
            {/* Remove ticket from cart */}
            {isInCart() ? (
              <button
                className="btn btn-error btn-sm"
                onClick={() => {
                  closePopup();
                  removeTicket(cartSeat.tickets.seatId);
                }}
              >
                Remove from cart
              </button>
            ) : (
              /* Add ticket to cart */
              <button
                onClick={() => {
                  closePopup();
                  return addTicket(cartSeat);
                }}
                className="btn btn-success btn-sm"
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);
