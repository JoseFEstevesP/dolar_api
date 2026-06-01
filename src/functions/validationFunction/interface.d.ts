export interface ValidatePropertyDataProps<T extends Record<string, unknown>> {
	property: Partial<T>;
	data: T | undefined;
	msg: MsgStructure;
	checkErrors?: (props: CheckValidationErrorsProps<T>) => void;
}

export interface CheckValidationErrorsProps<T extends Record<string, unknown>> {
	data: T;
	msg: MsgStructure;
	name: string;
}

export interface MsgStructure {
	validation: {
		disability: string;
		default: string;
	};
}
