export const booleanStatus = ({ status }: { status: string }) => {
	if (status === 'true') {
		return true;
	} else if (status === 'false') {
		return false;
	}
	return undefined;
};
