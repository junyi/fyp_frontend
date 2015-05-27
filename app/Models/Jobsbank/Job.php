<?php

namespace App\Models\Jobsbank;

use Illuminate\Database\Eloquent\Model;

class Job extends Model {

	protected $table = 'job';

	public function categories()
    {
        return $this->belongsToMany('JobCategory', 'assoc_job_job_category', 'jobId', 'categoryId');
    }

}