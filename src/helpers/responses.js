const { HttpStatusCode } = require('../common/constants');

exports.SuccessResponse = (data = {}) => {
    return {
        success: true,
        code: HttpStatusCode.OK,
        message: 'Success',
        data,
    };
};

exports.ListQueryResponse = (data) => {
    return {
        success: true,
        code: HttpStatusCode.OK,
        message: 'Success',
        data: {
            items: data.rows,
            count: data.count,
        },
    };
};

exports.ErrorResponse = (code, data = {}) => {
    return {
        success: false,
        code,
        message: 'Error',
        errors: data,
    };
};

exports.ValidationErrorResponse = (data = {}) => {
    return {
        success: false,
        code: HttpStatusCode.BAD_REQUEST,
        message: 'Validation error',
        errors: data,
    };
};

exports.ApiNotFoundErrorResponse = () => {
    return {
        success: false,
        code: HttpStatusCode.NOT_FOUND,
        message: 'API not found',
    };
};

exports.InternalServerErrorResponse = () => {
    return {
        success: false,
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
    };
};
