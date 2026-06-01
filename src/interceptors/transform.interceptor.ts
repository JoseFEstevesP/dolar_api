import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { successResponse } from '@/dto/api-response-wrapper.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ReturnType<typeof successResponse<T>>> {
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<ReturnType<typeof successResponse<T>>> {
		return next.handle().pipe(map(data => {
			if (data && typeof data === 'object' && 'data' in data && 'message' in data) {
				return successResponse(data.data, data.message);
			}
			return successResponse(data);
		}));
	}
}
