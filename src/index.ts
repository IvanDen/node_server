import express, {Request, Response} from "express";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery} from "./types";
import {CreateCourseModel} from "./models/CreateCourseModel";
import {QueryCoursesModel} from "./models/QueryCoursesModel";
import {UpdateCourseModel} from "./models/UpdateCourseModel";
import {CourseViewModel} from "./models/CourseViewModel";
import {URIParamsCourseIdModel} from "./models/URIParamsCourseIdModel";
const http = require('node:http')

export const app = express();
const port = 3000;

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404,
}

const jsonBodyMiddleware = express.json();

app.use(jsonBodyMiddleware);

type CourseType = {
    id: number
    title: string
    studentsCount: number
}

const db: {courses: CourseType[]} = {
    courses: [
        {id: 342, title: 'cours 1', studentsCount: 12},
        {id: 567, title: 'courses 3', studentsCount: 12},
        {id: 234, title: 'cours 4', studentsCount: 12},
        {id: 789, title: 'courses 5', studentsCount: 12},
    ]
}

const getCourseViewModel = (dbCourse: CourseType): CourseViewModel => {
    return {
        id: dbCourse.id,
        title: dbCourse.title
    }
}

app.get('/', (req, res) => {
    res.json({message: 'Hello users.'})
})


app.get('/courses', (
    req: RequestWithQuery<QueryCoursesModel>,
    res: Response<CourseViewModel[]>
) => {

    let foundCourses = db.courses

    if (req.query.title) {
        foundCourses = foundCourses
            .filter(c => c.title.indexOf(req.query.title as string) > -1)
    }

    res.json(foundCourses.map(getCourseViewModel))
})

app.get('/courses/:id', (
    req: RequestWithParams<URIParamsCourseIdModel>,
    res: Response<CourseViewModel>
) => {

    const foundCourse = db.courses.find(item => item.id.toString() === req.params.id)
    if (!foundCourse) {
        res.sendStatus(404)
        return
    }
    res.json(getCourseViewModel(foundCourse))
})

app.post('/courses', (
    req: RequestWithBody<CreateCourseModel>,
    res: Response<CourseViewModel>
) => {
    if (!req.body?.title) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
        return;
    }
    const createdCourse: CourseType = {
        id: +(new Date),
        title: req?.body?.title,
        studentsCount: 0
    }
    db.courses.push(createdCourse)
    res
        .status(HTTP_STATUSES.CREATED_201)
        .json(getCourseViewModel(createdCourse))
})

app.delete('/courses/:id', (
    req: RequestWithParams<URIParamsCourseIdModel>,
    res
) => {
    db.courses = db.courses.filter(item => item.id.toString() !== req.params.id)
    // if (!find) {
    //     res.sendStatus(404)
    //     return
    // }

    res.sendStatus(204);
})

app.put('/courses/:id', (
    req: RequestWithParamsAndBody<URIParamsCourseIdModel, UpdateCourseModel>,
    res
) => {
    if (!req.body?.title) {
        res.sendStatus(400);
        return;
    }

    const find = db.courses.find(item => item.id.toString() === req.params.id)
    if (!find) {
        res.sendStatus(404)
        return
    }
    find.title = req.body?.title
    res.sendStatus(204)
})

app.delete('/__test__/data', (req, res) => {
    db.courses = [];
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})

app.listen(port, () => {
    console.log(`Tis application started on port ${port}.`)
});