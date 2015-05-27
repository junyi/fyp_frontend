<?php

use App\Models\Jobsbank\Job;
use App\Models\Jobsbank\JobCategory;
/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

$app->get('/', function() use ($app) {
    return view('home');
});

$app->get('/job_category', function() use ($app) {
	// Cache this query for 10 minutes
	$result = Cache::remember('job_count_by_category', 10, function() 
	{
		return DB::table('job_category as jc')
				->select(DB::raw('count(1) as count, jc.category'))
				->join('assoc_job_job_category as ajjc', 'jc.categoryId', '=', 'ajjc.categoryId')
				->join('job as j', 'j.jobId', '=', 'ajjc.jobId')
				->groupBy('jc.categoryId')
				->get();
	});
    return json_encode($result);
});