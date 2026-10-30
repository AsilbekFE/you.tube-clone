export const errorHandler = (err, req, res, next) => {
    console.error('Xatolik yuz berdi:', err);

    const status = err.status || 500;
    const message = err.message || 'Ichki server xatoligi yuz berdi!';

    res.status(status).json({
        status,
        message
    });
};