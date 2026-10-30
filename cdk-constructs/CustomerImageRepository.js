"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerImageRepository = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Sites resolve their tag at least daily, and resolving records a pull, so
// an image goes unpulled only once no site uses it. ECR only archives on pull
// age, and only deletes archived images, hence archive then delete.
const keepWhileSitesUseLifecyclePolicy = {
    rules: [
        {
            rulePriority: 1,
            description: 'Delete untagged images no kept image refers to',
            selection: {
                tagStatus: 'untagged',
                countType: 'sinceImagePushed',
                countUnit: 'days',
                countNumber: 1,
            },
            action: { type: 'expire' },
        },
        {
            rulePriority: 2,
            description: 'Archive images no site has used for 14 days',
            selection: {
                tagStatus: 'tagged',
                tagPatternList: ['*'],
                countType: 'sinceImagePulled',
                countUnit: 'days',
                countNumber: 14,
            },
            action: { type: 'transition', targetStorageClass: 'archive' },
        },
        {
            rulePriority: 3,
            description: 'Delete images archived for 90 days',
            selection: {
                tagStatus: 'any',
                storageClass: 'archive',
                countType: 'sinceImageTransitioned',
                countUnit: 'days',
                countNumber: 90,
            },
            action: { type: 'expire' },
        },
    ],
};
class CustomerImageRepository extends aws_cdk_lib_1.aws_ecr.Repository {
    constructor(scope, id, { tagResolver, ...props }) {
        super(scope, id, props);
        const cfnRepository = this.node.defaultChild;
        cfnRepository.lifecyclePolicy = {
            lifecyclePolicyText: JSON.stringify(keepWhileSitesUseLifecyclePolicy),
        };
        this.grant(tagResolver, 'ecr:DescribeImages', 'ecr:BatchGetImage');
    }
}
exports.CustomerImageRepository = CustomerImageRepository;
