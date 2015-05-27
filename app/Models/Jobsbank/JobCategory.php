<?php

namespace App\Models\Jobsbank;

use Illuminate\Database\Eloquent\Model;

class JobCategory extends Model {

	protected $table = 'job_category';

	public function jobs()
    {
        return $this->belongsToMany('Job', 'assoc_job_job_category', 'categoryId', 'jobId');
    }
}