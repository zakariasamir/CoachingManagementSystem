import React, { useState, useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

dayjs.extend(isBetween);

interface BusySlot {
  start: string;
  end: string;
  status: string;
}

interface ParsedBusySlot {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  status: string;
}

interface SessionFormData {
  title: string;
  startTime: string;
  endTime: string;
  coachId: string;
  entrepreneurIds: string[];
  notes: string;
  price: number;
}

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: SessionFormData) => Promise<void>;
  organizationId: string;
  isCreating?: boolean;
}

const fetcher = (url: string) =>
  fetch(url, {
    credentials: "include",
  }).then((res) => res.json());

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  __v: number;
}

const SessionForm: React.FC<SessionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  organizationId,
  isCreating,
}) => {
  const [sessionData, setSessionData] = useState({
    title: "",
    startTime: dayjs().toISOString(),
    endTime: dayjs().add(1, "hour").toISOString(),
    coachId: "",
    entrepreneurIds: [] as string[],
    notes: "",
    price: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedStartDate, setSelectedStartDate] = useState<dayjs.Dayjs>(
    dayjs()
  );
  const [selectedEndDate, setSelectedEndDate] = useState<dayjs.Dayjs>(
    dayjs().add(1, "hour")
  );

  const { data: fetchedBusySlotsResponse } = useSWR<BusySlot[]>(
    sessionData.coachId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/manager/coach/${sessionData.coachId}/availability`
      : null,
    fetcher
  );

  const { data: coachesData } = useSWR<User[]>(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/users?organizationId=${organizationId}&role=coach`
      : null,
    fetcher
  );

  const { data: entrepreneursData } = useSWR<User[]>(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/users?organizationId=${organizationId}&role=entrepreneur`
      : null,
    fetcher
  );

  const [openCoach, setOpenCoach] = useState(false);
  const [openEntrepreneurs, setOpenEntrepreneurs] = useState(false);

  const parsedBusySlots: ParsedBusySlot[] = useMemo(() => {
    if (!fetchedBusySlotsResponse) return [];
    return fetchedBusySlotsResponse.map((slot) => ({
      start: dayjs(slot.start),
      end: dayjs(slot.end),
      status: slot.status,
    }));
  }, [fetchedBusySlotsResponse]);

  const hasDateBusySlots = useCallback(
    (date: dayjs.Dayjs): boolean => {
      return parsedBusySlots.some(
        (slot) =>
          date.isSame(slot.start, "day") ||
          date.isSame(slot.end, "day") ||
          date.isBetween(slot.start, slot.end, "day", "[]")
      );
    },
    [parsedBusySlots]
  );
  const shouldDisableDate = useCallback(
    (date: dayjs.Dayjs): boolean => {
      if (date.isBefore(dayjs().startOf("day"))) {
        return true;
      }
      return false;
    },
    [hasDateBusySlots]
  );

  const shouldDisableTime = useCallback(
    (timeValue: dayjs.Dayjs | null, view: string): boolean => {
      if (!timeValue || !sessionData.coachId) {
        return false;
      }
      const now = dayjs();
      if (timeValue.isSame(now, "day") && timeValue.isBefore(now)) {
        return true;
      }

      for (const slot of parsedBusySlots) {
        if (timeValue.isBetween(slot.start, slot.end, null, "[]")) {
          if (view === "hours") {
            if (
              timeValue.hour() >= slot.start.hour() &&
              timeValue.hour() <= slot.end.hour()
            ) {
              if (
                timeValue.hour() === slot.start.hour() &&
                timeValue.minute() < slot.start.minute()
              ) {
              } else if (
                timeValue.hour() === slot.end.hour() &&
                timeValue.minute() > slot.end.minute()
              ) {
              } else {
                return true;
              }
            }
          }
          return true;
        }
      }

      return false;
    },
    [sessionData.coachId, parsedBusySlots]
  );

  const handleStartDateChange = (newValue: dayjs.Dayjs | null) => {
    if (!newValue) return;

    const isBusy = parsedBusySlots.some((slot) =>
      newValue.isBetween(slot.start, slot.end, null, "[]")
    );

    if (isBusy) {
      setErrors((prev) => ({
        ...prev,
        startTime: "This time slot is already booked for the selected coach.",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, startTime: "" }));
    setSelectedStartDate(newValue);

    const newEndTime = newValue.add(1, "hour");
    if (newEndTime.isBefore(selectedEndDate)) {
      setSelectedEndDate(newEndTime);
      setSessionData((prev) => ({
        ...prev,
        startTime: newValue.toISOString(),
        endTime: newEndTime.toISOString(),
      }));
    } else {
      setSelectedEndDate(newEndTime);
      setSessionData((prev) => ({
        ...prev,
        startTime: newValue.toISOString(),
        endTime: newEndTime.toISOString(),
      }));
    }
  };

  const handleEndDateChange = (newValue: dayjs.Dayjs | null) => {
    if (!newValue) return;

    const isBusy = parsedBusySlots.some((slot) =>
      newValue.isBetween(slot.start, slot.end, null, "[]")
    );

    if (isBusy) {
      setErrors((prev) => ({
        ...prev,
        endTime: "This time slot is already booked for the selected coach.",
      }));
      return;
    }

    if (newValue.isBefore(selectedStartDate)) {
      setErrors((prev) => ({
        ...prev,
        endTime: "End time must be after start time.",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, endTime: "" }));
    setSelectedEndDate(newValue);
    setSessionData((prev) => ({
      ...prev,
      endTime: newValue.toISOString(),
    }));
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    setSessionData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleCoachChange = (value: string) => {
    setSessionData((prev) => ({
      ...prev,
      coachId: value,
      startTime: dayjs().toISOString(),
      endTime: dayjs().add(1, "hour").toISOString(),
    }));
    setSelectedStartDate(dayjs());
    setSelectedEndDate(dayjs().add(1, "hour"));
    setErrors({});
  };

  const handleEntrepreneurSelect = (entrepreneurId: string) => {
    setSessionData((prev) => ({
      ...prev,
      entrepreneurIds: prev.entrepreneurIds.includes(entrepreneurId)
        ? prev.entrepreneurIds.filter((id) => id !== entrepreneurId)
        : [...prev.entrepreneurIds, entrepreneurId],
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { [key: string]: string } = {};
    if (!sessionData.title) newErrors.title = "Session title is required.";
    if (!sessionData.coachId) newErrors.coachId = "Coach is required.";
    if (sessionData.entrepreneurIds.length === 0)
      newErrors.entrepreneurIds = "At least one entrepreneur is required.";
    if (sessionData.price <= 0)
      newErrors.price = "Price must be greater than 0.";

    const isStartTimeBusy = parsedBusySlots.some((slot) =>
      dayjs(sessionData.startTime).isBetween(slot.start, slot.end, null, "[]")
    );
    const isEndTimeBusy = parsedBusySlots.some((slot) =>
      dayjs(sessionData.endTime).isBetween(slot.start, slot.end, null, "[]")
    );

    if (isStartTimeBusy) {
      newErrors.startTime = "Selected start time is booked for this coach.";
    }
    if (isEndTimeBusy) {
      newErrors.endTime = "Selected end time is booked for this coach.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(sessionData);
      setSessionData({
        title: "",
        startTime: dayjs().toISOString(),
        endTime: dayjs().add(1, "hour").toISOString(),
        coachId: "",
        entrepreneurIds: [],
        notes: "",
        price: 0,
      });
      onClose();
    } catch (error: any) {
      console.error("Form submission error:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              name="title"
              value={sessionData.title}
              onChange={handleChange}
              placeholder="Enter session title"
              required
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Coach</Label>
            <Popover open={openCoach} onOpenChange={setOpenCoach}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCoach}
                  className={cn(
                    "w-full justify-between",
                    errors.coachId ? "border-red-500" : ""
                  )}
                >
                  {sessionData.coachId && coachesData
                    ? coachesData.find(
                        (coach) => coach._id === sessionData.coachId
                      )
                      ? `${
                          coachesData.find(
                            (coach) => coach._id === sessionData.coachId
                          )?.firstName
                        } ${
                          coachesData.find(
                            (coach) => coach._id === sessionData.coachId
                          )?.lastName
                        }`
                      : "Select coach..."
                    : "Select coach..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search coach..." />
                  <CommandEmpty>
                    {!coachesData ? "Loading..." : "No coach found."}
                  </CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-y-auto">
                    {coachesData ? (
                      coachesData.map((coach) => (
                        <CommandItem
                          key={coach._id}
                          onSelect={() => {
                            handleCoachChange(coach._id);
                            setOpenCoach(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              sessionData.coachId === coach._id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {`${coach.firstName} ${coach.lastName}`}
                        </CommandItem>
                      ))
                    ) : (
                      <CommandItem disabled>No coaches available</CommandItem>
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.coachId && (
              <p className="text-sm text-red-500">{errors.coachId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Entrepreneurs</Label>
            <Popover
              open={openEntrepreneurs}
              onOpenChange={setOpenEntrepreneurs}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openEntrepreneurs}
                  className={cn(
                    "w-full justify-between",
                    errors.entrepreneurIds ? "border-red-500" : ""
                  )}
                >
                  {sessionData.entrepreneurIds.length > 0
                    ? `${sessionData.entrepreneurIds.length} selected`
                    : "Select entrepreneurs..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search entrepreneurs..." />
                  <CommandEmpty>
                    {!entrepreneursData
                      ? "Loading..."
                      : "No entrepreneur found."}
                  </CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-y-auto">
                    {entrepreneursData ? (
                      entrepreneursData.map((entrepreneur) => (
                        <CommandItem
                          key={entrepreneur._id}
                          onSelect={() =>
                            handleEntrepreneurSelect(entrepreneur._id)
                          }
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{`${entrepreneur.firstName} ${entrepreneur.lastName}`}</span>
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                sessionData.entrepreneurIds.includes(
                                  entrepreneur._id
                                )
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))
                    ) : (
                      <CommandItem disabled>
                        No entrepreneurs available
                      </CommandItem>
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.entrepreneurIds && (
              <p className="text-sm text-red-500">{errors.entrepreneurIds}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {sessionData.entrepreneurIds.map((id) => {
                const entrepreneur = entrepreneursData?.find(
                  (e) => e._id === id
                );
                return entrepreneur ? (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {`${entrepreneur.firstName} ${entrepreneur.lastName}`}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleEntrepreneurSelect(id);
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Start Time</Label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={selectedStartDate}
                  onChange={handleStartDateChange}
                  minDateTime={dayjs()}
                  disabled={!sessionData.coachId}
                  shouldDisableTime={shouldDisableTime}
                  views={["year", "month", "day", "hours", "minutes"]}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      error: !!errors.startTime,
                      helperText: errors.startTime,
                      size: "small",
                    },
                    actionBar: {
                      actions: ["clear", "accept"],
                    },
                  }}
                  format="MMM DD, YYYY hh:mm A"
                  minutesStep={15}
                  closeOnSelect={false}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="space-y-4">
              <Label>End Time</Label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={selectedEndDate}
                  onChange={handleEndDateChange}
                  minDateTime={dayjs()}
                  disabled={!sessionData.coachId}
                  shouldDisableTime={shouldDisableTime}
                  views={["year", "month", "day", "hours", "minutes"]}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      error: !!errors.endTime,
                      helperText: errors.endTime,
                      size: "small",
                    },
                    actionBar: {
                      actions: ["clear", "accept"],
                    },
                  }}
                  format="MMM DD, YYYY hh:mm A"
                  minutesStep={15}
                  closeOnSelect={false}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="5"
              value={sessionData.price}
              onChange={handleChange}
              placeholder="Enter session price"
              required
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={sessionData.notes}
              onChange={handleChange}
              placeholder="Add any session notes..."
              className={errors.notes ? "border-red-500" : ""}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isCreating ||
              Object.values(errors).some((error) => !!error) ||
              !sessionData.startTime ||
              !sessionData.endTime ||
              !sessionData.coachId ||
              sessionData.entrepreneurIds.length === 0
            }
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </div>
            ) : (
              "Create Session"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionForm;
